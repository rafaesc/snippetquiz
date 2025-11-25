package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.ContentEntryDTOResponse;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.YoutubeChannelRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.YoutubeChannelId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentEntryServiceImplTest {

    @Mock
    private ContentEntryRepository contentEntryRepository;

    @Mock
    private ContentBankRepository contentBankRepository;

    @Mock
    private ContentEntryTopicRepository contentEntryTopicRepository;

    @Mock
    private YoutubeChannelRepository youtubeChannelRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private EventBus eventBus;

    @InjectMocks
    private ContentEntryServiceImpl contentEntryService;

    private UserId userId;
    private ContentBankId bankId;
    private ContentEntryId entryId;

    @BeforeEach
    void setUp() {
        userId = new UserId(UUID.randomUUID());
        bankId = new ContentBankId(UUID.randomUUID());
        entryId = new ContentEntryId(UUID.randomUUID());
    }

    @Nested
    class CreateTests {

        @Test
        void create_whenBankNotFound_throwsNotFoundException() {
            // Given
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentEntryService.create(
                    userId,
                    "https://example.com",
                    "<html>content</html>",
                    "full_html",
                    "Title",
                    bankId,
                    null,
                    null,
                    null,
                    null,
                    null));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void create_fullHtml_whenExistingEntry_updatesAndSaves_withoutEmittingTopics() {
            // Given
            var bank = new ContentBank(bankId, userId, "Bank");
            var existingEntry = new ContentEntry(
                    userId,
                    bankId,
                    ContentType.FULL_HTML,
                    "old content",
                    "https://example.com",
                    "Old Title",
                    null,
                    null,
                    null);
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.of(bank));
            when(contentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(
                    "https://example.com", ContentType.FULL_HTML, bankId)).thenReturn(Optional.of(existingEntry));
            when(contentEntryRepository.save(existingEntry)).thenReturn(existingEntry);

            // When
            contentEntryService.create(
                    userId,
                    "https://example.com",
                    "   <html>content</html>   ",
                    "full_html",
                    "Title",
                    bankId,
                    null,
                    null,
                    null,
                    null,
                    null);

            // Then
            assertThat(existingEntry.getContent()).isEqualTo("<html>content</html>");
            assertThat(existingEntry.getPageTitle()).isEqualTo("Title");
            verify(contentEntryRepository, times(1)).save(existingEntry);
            assertThat(bank.getContentEntries()).isEmpty();

            // Verify no events published to EventBus on update-only path
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void create_videoTranscript_whenChannelMissing_createsChannelAndEmitsTopics() {
            // Given
            var bank = new ContentBank(bankId, userId, "Bank");
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.of(bank));
            when(youtubeChannelRepository.findByChannelId("chan_123")).thenReturn(Optional.empty());
            when(youtubeChannelRepository.save(any(YoutubeChannel.class)))
                    .thenAnswer(invocation -> {
                        var youtubeChannel = (YoutubeChannel) invocation.getArgument(0);
                        youtubeChannel.setId(new YoutubeChannelId(1L));
                        return youtubeChannel;
                    });
            // Return the same entry that is passed into save
            when(contentEntryRepository.save(any(ContentEntry.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            contentEntryService.create(
                    userId,
                    "https://youtube.com/watch?v=abc",
                    "Transcript content",
                    "video_transcript",
                    "Video Title",
                    bankId,
                    "abc",
                    120,
                    "chan_123",
                    "Channel Name",
                    "avatar.png");

            // Then
            verify(youtubeChannelRepository, times(1)).save(any(YoutubeChannel.class));
            verify(contentEntryRepository, times(1)).save(any(ContentEntry.class));
            assertThat(bank.getContentEntries()).hasSize(1);
            var savedEntry = bank.getContentEntries().getFirst();
            assertThat(savedEntry.getContent()).isEqualTo("Transcript content");
            assertThat(savedEntry.getPageTitle()).isEqualTo("Video Title");

            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(2)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());
            var allEvents = eventsCaptor.getAllValues().stream()
                    .flatMap(Collection::stream)
                    .map(e -> e.getClass().getSimpleName())
                    .toList();
            assertThat(allEvents).anyMatch(n -> n.equals("ContentEntryCreatedDomainEvent"));
            assertThat(allEvents).anyMatch(n -> n.equals("ContentBankEntriesUpdatedDomainEvent"));
        }
    }

    @Nested
    class FindByIdTests {

        @Test
        void findById_whenEntryNotFound_throwsNotFoundException() {
            // Given
            when(contentEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentEntryService.findById(userId, entryId));
        }

        @Test
        void findById_returnsDtoWithTopics() {
            // Given
            var entry = new ContentEntry(
                    userId,
                    bankId,
                    ContentType.FULL_HTML,
                    "Some content",
                    "https://example.com",
                    "Title",
                    null,
                    null,
                    null);
            when(contentEntryRepository.findByIdAndUserId(entry.getId(), userId)).thenReturn(Optional.of(entry));

            var t1 = new ContentEntryTopic();
            var t2 = new ContentEntryTopic();
            t1.setContentEntryId(entry.getId());
            t2.setContentEntryId(entry.getId());
            t1.setTopicId(new TopicId(1L));
            t2.setTopicId(new TopicId(2L));
            when(contentEntryTopicRepository.findByContentEntryId(entry.getId())).thenReturn(List.of(t1, t2));

            var topicA = mock(Topic.class);
            var topicB = mock(Topic.class);
            when(topicA.getTopic()).thenReturn("Java");
            when(topicB.getTopic()).thenReturn("Spring");
            when(topicRepository.findAllByIdInAndUserId(anyList(), eq(userId))).thenReturn(List.of(topicA, topicB));

            // When
            ContentEntryDTOResponse response = contentEntryService.findById(userId, entry.getId());

            // Then
            assertThat(response.getId()).isEqualTo(entry.getId().toString());
            assertThat(response.getContentType()).isEqualTo("full_html");
            assertThat(response.getSourceUrl()).isEqualTo("https://example.com");
            assertThat(response.getPageTitle()).isEqualTo("Title");
            assertThat(response.getQuestionsGenerated()).isEqualTo(false);
            assertThat(response.getTopics()).containsExactlyInAnyOrder("Java", "Spring");
        }
    }

    @Nested
    class FindAllTests {

        @Test
        void findAll_whenBankNotFound_throwsNotFoundException() {
            // Given
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class,
                    () -> contentEntryService.findAll(userId, bankId, "", PageRequest.of(0, 10)));
        }

        @Test
        void findAll_returnsPagedEntriesWithTopics() {
            // Given
            var bank = new ContentBank(bankId, userId, "Bank");
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.of(bank));

            var entry = new ContentEntry(
                    userId,
                    bankId,
                    ContentType.FULL_HTML,
                    "Some content",
                    "https://example.com",
                    "Title",
                    null,
                    null,
                    null);
            Page<ContentEntry> page = new PageImpl<>(List.of(entry));
            Pageable pageable = PageRequest.of(0, 10);
            when(contentEntryRepository.findByContentBankId(bankId, pageable)).thenReturn(page);

            var t1 = new ContentEntryTopic();
            t1.setContentEntryId(entry.getId());
            t1.setTopicId(new TopicId(1L));
            when(contentEntryTopicRepository.findByContentEntryId(entry.getId())).thenReturn(List.of(t1));

            var topicA = mock(Topic.class);
            when(topicA.getTopic()).thenReturn("Java");
            when(topicRepository.findAllByIdInAndUserId(anyList(), eq(userId))).thenReturn(List.of(topicA));

            // When
            PagedModelResponse<ContentEntryDTOResponse> result = contentEntryService.findAll(userId, bankId, "",
                    pageable);

            // Then
            assertThat(result.getMetadata().totalElements()).isEqualTo(1);
            assertThat(result.getContent()).hasSize(1);
            ContentEntryDTOResponse item = result.getContent().getFirst();
            assertThat(item.getId()).isEqualTo(entry.getId().toString());
            assertThat(item.getPageTitle()).isEqualTo("Title");
            assertThat(item.getTopics()).containsExactly("Java");
        }
    }

    @Nested
    class CloneTests {

        @Test
        void clone_whenSourceEntryNotFound_throwsNotFoundException() {
            // Given
            when(contentEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentEntryService.clone(userId, entryId, bankId));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void clone_whenTargetBankNotFound_throwsNotFoundException() {
            // Given
            var source = new ContentEntry(
                    userId,
                    new ContentBankId(UUID.randomUUID()),
                    ContentType.FULL_HTML,
                    "content",
                    "url",
                    "title",
                    100,
                    "vid",
                    null);
            when(contentEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(Optional.of(source));
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentEntryService.clone(userId, entryId, bankId));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void clone_success_clonesEntryAddsToBankAndCopiesTopics() {
            // Given
            var source = new ContentEntry(
                    userId,
                    new ContentBankId(UUID.randomUUID()),
                    ContentType.FULL_HTML,
                    "content",
                    "url",
                    "title",
                    100,
                    "vid",
                    null);
            source.updatedTopics(List.of(new Topic(source.getUserId(), "bank"), new Topic(source.getUserId(), "demo")));
            entryId = source.getId(); // align test entryId with real source
            var targetBank = new ContentBank(bankId, userId, "Target Bank");
            when(contentEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(Optional.of(source));
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.of(targetBank));

            when(contentEntryRepository.save(any(ContentEntry.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            var st1 = new ContentEntryTopic();
            st1.setContentEntryId(entryId);
            st1.setTopicId(new TopicId(1L));
            var st2 = new ContentEntryTopic();
            st2.setContentEntryId(entryId);
            st2.setTopicId(new TopicId(2L));
            when(contentEntryTopicRepository.findByContentEntryId(entryId)).thenReturn(List.of(st1, st2));

            // Replace mocked Topics with real instances
            Topic topicA = new Topic(userId, "Java");
            Topic topicB = new Topic(userId, "Spring");
            when(topicRepository.findAllByIdInAndUserId(anyList(), eq(userId))).thenReturn(List.of(topicA, topicB));

            // When
            contentEntryService.clone(userId, entryId, bankId);

            // Then
            var captor = ArgumentCaptor.forClass(ContentEntry.class);
            verify(contentEntryRepository, times(1)).save(captor.capture());
            var savedClone = captor.getValue();
            assertThat(savedClone.getContentBankId()).isEqualTo(targetBank.getId());
            assertThat(targetBank.getContentEntries()).hasSize(1);
            verify(contentEntryTopicRepository, times(2)).save(any(ContentEntryTopic.class));
            verify(topicRepository, times(1)).findAllByIdInAndUserId(anyList(), eq(userId));

            // Verify domain event published via EventBus (events are drained from the
            // aggregate)
            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(2)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());

            boolean publishedTopicAdded = eventsCaptor.getAllValues().stream()
                    .flatMap(Collection::stream)
                    .anyMatch(e -> e.getClass().getSimpleName().equals("ContentEntryTopicAddedDomainEvent"));
            assertThat(publishedTopicAdded).isTrue();

            boolean publishedBankEntriesUpdated = eventsCaptor.getAllValues().stream()
                    .flatMap(Collection::stream)
                    .anyMatch(e -> e.getClass().getSimpleName().equals("ContentBankEntriesUpdatedDomainEvent"));
            assertThat(publishedBankEntriesUpdated).isTrue();
        }
    }

    @Nested
    class RemoveTests {

        @Test
        void remove_whenEntryNotFound_throwsNotFoundException() {
            // Given
            when(contentEntryRepository.findByIdAndUserId(entryId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentEntryService.remove(userId, entryId));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void remove_whenBankNotFound_throwsNotFoundException() {
            // Given
            var entry = new ContentEntry(
                    userId,
                    bankId,
                    ContentType.FULL_HTML,
                    "content",
                    "url",
                    "title",
                    100,
                    "vid",
                    null);
            when(contentEntryRepository.findByIdAndUserId(entry.getId(), userId)).thenReturn(Optional.of(entry));
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentEntryService.remove(userId, entry.getId()));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void remove_success_callsDomainDeletesAndRepositoryDelete() {
            // Given
            var entry = new ContentEntry(
                    userId,
                    bankId,
                    ContentType.FULL_HTML,
                    "content",
                    "url",
                    "title",
                    100,
                    "vid",
                    null);
            var bank = new ContentBank(bankId, userId, "Bank");
            when(contentEntryRepository.findByIdAndUserId(entry.getId(), userId)).thenReturn(Optional.of(entry));
            when(contentBankRepository.findByIdAndUserId(bankId, userId)).thenReturn(Optional.of(bank));

            // When
            contentEntryService.remove(userId, entry.getId());

            // Then
            // Assert domain events/state instead of spying
            verify(contentEntryRepository, times(1)).delete(entry);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(1)).publish(eq(entry.aggregateType()), eventsCaptor.capture());

            boolean publishedDelete = eventsCaptor.getValue().stream()
                    .anyMatch(e -> e.getClass().getSimpleName().equals("ContentEntryDeletedDomainEvent"));

            assertThat(publishedDelete).isTrue();
        }
    }
}