package ai.snippetquiz.core_service.contentbank.application.service;

import ai.snippetquiz.core_service.contentbank.application.ContentBankItemResponse;
import ai.snippetquiz.core_service.contentbank.application.ContentBankResponse;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.ConflictException;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.anyList;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentBankServiceImplTest {

    @Mock
    private ContentBankRepository contentBankRepository;

    @Mock
    private ContentEntryRepository contentEntryRepository;

    @Mock
    private EventBus eventBus;

    @InjectMocks
    private ContentBankServiceImpl contentBankService;

    private UserId userId;
    private ContentBankId contentBankId;

    @BeforeEach
    void setUp() {
        userId = new UserId(UUID.randomUUID());
        contentBankId = new ContentBankId(UUID.randomUUID());
    }

    @Nested
    class CreateTests {

        @Test
        void create_whenNameExistsForUserAndDifferentId_throwsConflictException() {
            // Given
            when(contentBankRepository.findByUserIdAndNameAndIdNot(userId, "Bank A", contentBankId))
                    .thenReturn(Optional.of(new ContentBank(new ContentBankId(UUID.randomUUID()), userId, "Bank A")));

            // When & Then
            assertThrows(ConflictException.class, () -> contentBankService.create(contentBankId, userId, "Bank A"));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void create_whenIdExistsAndBelongsToAnotherUser_throwsConflictException() {
            // Given
            UserId otherUser = new UserId(UUID.randomUUID());
            ContentBank existing = new ContentBank(contentBankId, otherUser, "Existing Bank");
            when(contentBankRepository.findByUserIdAndNameAndIdNot(userId, "Bank B", contentBankId))
                    .thenReturn(Optional.empty());
            when(contentBankRepository.findById(contentBankId)).thenReturn(Optional.of(existing));

            // When & Then
            assertThrows(ConflictException.class, () -> contentBankService.create(contentBankId, userId, "Bank B"));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        @SuppressWarnings("unchecked")
        void create_whenIdExistsAndBelongsToUser_renamesAndSaves() {
            // Given
            ContentBank existing = new ContentBank(contentBankId, userId, "Old Name");
            when(contentBankRepository.findByUserIdAndNameAndIdNot(userId, "New Name", contentBankId))
                    .thenReturn(Optional.empty());
            when(contentBankRepository.findById(contentBankId)).thenReturn(Optional.of(existing));

            // When
            contentBankService.create(contentBankId, userId, "New Name");

            // Then
            assertThat(existing.getName()).isEqualTo("New Name");
            verify(contentBankRepository, times(1)).save(existing);

            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(1)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());
            boolean publishedRenamed = eventsCaptor.getAllValues().stream()
                    .flatMap(list -> ((List<?>) list).stream())
                    .anyMatch(e -> e.getClass().getSimpleName().equals("ContentBankRenamedDomainEvent"));
            assertThat(publishedRenamed).isTrue();
        }

        @Test
        @SuppressWarnings("unchecked")
        void create_whenIdNotExists_createsNewBankAndSaves() {
            // Given
            when(contentBankRepository.findByUserIdAndNameAndIdNot(userId, "Fresh Bank", contentBankId))
                    .thenReturn(Optional.empty());
            when(contentBankRepository.findById(contentBankId)).thenReturn(Optional.empty());

            // When
            contentBankService.create(contentBankId, userId, "Fresh Bank");

            // Then
            ArgumentCaptor<ContentBank> captor = ArgumentCaptor.forClass(ContentBank.class);
            verify(contentBankRepository, times(1)).save(captor.capture());
            ContentBank saved = captor.getValue();
            assertThat(saved.getId()).isEqualTo(contentBankId);
            assertThat(saved.getUserId()).isEqualTo(userId);
            assertThat(saved.getName()).isEqualTo("Fresh Bank");

            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(1)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());
            boolean publishedCreated = eventsCaptor.getAllValues().stream()
                    .flatMap(list -> ((List<?>) list).stream())
                    .anyMatch(e -> e.getClass().getSimpleName().equals("ContentBankCreatedDomainEvent"));
            assertThat(publishedCreated).isTrue();
        }
    }

    @Nested
    class FindAllTests {
        @Test
        void findAll_shouldReturnPagedContentBanks() {
            // Given
            Pageable pageable = PageRequest.of(0, 10);
            ContentBank bank = new ContentBank(contentBankId, userId, "My Bank");
            Page<ContentBank> page = new PageImpl<>(List.of(bank));
            when(contentBankRepository.findByUserIdAndNameContainingIgnoreCase(userId, "", pageable))
                    .thenReturn(page);
            when(contentEntryRepository.countByContentBankId(contentBankId)).thenReturn(3L);

            // When
            PagedModelResponse<ContentBankItemResponse> response = contentBankService.findAll(userId, "", pageable);

            // Then
            assertThat(response.getMetadata().totalElements()).isEqualTo(1);
            assertThat(response.getContent()).hasSize(1);
            ContentBankItemResponse item = response.getContent().getFirst();
            assertThat(item.id()).isEqualTo(contentBankId.getValue());
            assertThat(item.name()).isEqualTo("My Bank");
            assertThat(item.contentEntries()).isEqualTo(3);
        }
    }

    @Nested
    class FindOneTests {
        @Test
        void findOne_whenNotFound_throwsNotFoundException() {
            // Given
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentBankService.findOne(userId, contentBankId));
        }

        @Test
        void findOne_whenFound_returnsContentBankResponse() {
            // Given
            ContentBank bank = new ContentBank(contentBankId, userId, "One Bank");
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.of(bank));
            when(contentEntryRepository.countByContentBankId(contentBankId)).thenReturn(5L);

            // When
            ContentBankResponse response = contentBankService.findOne(userId, contentBankId);

            // Then
            assertThat(response.getId()).isEqualTo(contentBankId.getValue().toString());
            assertThat(response.getName()).isEqualTo("One Bank");
            assertThat(response.getEntryCount()).isEqualTo(5);
        }
    }

    @Nested
    class RemoveTests {
        @Test
        void remove_whenNotFound_throwsNotFoundException() {
            // Given
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentBankService.remove(userId, contentBankId));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        @SuppressWarnings("unchecked")
        void remove_whenFound_callsDeleteOnDomainAndRepository() {
            // Given
            ContentBank bank = new ContentBank(contentBankId, userId, "Bank Name");
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.of(bank));

            // When
            contentBankService.remove(userId, contentBankId);

            // Then
            // Using real domain object; verify repository deletion interaction
            verify(contentBankRepository, times(1)).deleteByIdAndUserId(contentBankId, userId);

            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(1)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());
            boolean publishedDeleted = eventsCaptor.getAllValues().stream()
                    .flatMap(list -> ((List<?>) list).stream())
                    .anyMatch(e -> e.getClass().getSimpleName().equals("ContentBankDeletedDomainEvent"));
            assertThat(publishedDeleted).isTrue();
        }
    }

    @Nested
    class DuplicateTests {
        @Test
        void duplicate_whenOriginalNotFound_throwsNotFoundException() {
            // Given
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(NotFoundException.class, () -> contentBankService.duplicate(userId, contentBankId, "Copy Name"));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        void duplicate_whenFinalNameExists_throwsConflictException() {
            // Given
            ContentBank original = new ContentBank(contentBankId, userId, "Original Bank");
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.of(original));
            when(contentBankRepository.findByUserIdAndName(userId, "Copy Name"))
                    .thenReturn(Optional.of(new ContentBank(new ContentBankId(UUID.randomUUID()), userId, "Copy Name")));

            // When & Then
            assertThrows(ConflictException.class, () -> contentBankService.duplicate(userId, contentBankId, "Copy Name"));

            // Verify no events published
            verify(eventBus, times(0)).publish(any(), any());
        }

        @Test
        @SuppressWarnings("unchecked")
        void duplicate_whenNameBlank_usesDefaultAndCreatesNewBank() {
            // Given
            ContentBank original = new ContentBank(contentBankId, userId, "Original Bank");
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.of(original));
            when(contentBankRepository.findByUserIdAndName(eq(userId), eq("Copy of Original Bank")))
                    .thenReturn(Optional.empty());
            when(contentBankRepository.save(any(ContentBank.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            contentBankService.duplicate(userId, contentBankId, "   ");

            // Then
            verify(contentBankRepository, atLeastOnce()).save(any(ContentBank.class));
            verify(contentEntryRepository, times(1)).saveAll(anyList());

            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(1)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());
            var allEvents = eventsCaptor.getAllValues().stream()
                    .flatMap(list -> ((List<?>) list).stream())
                    .map(e -> e.getClass().getSimpleName())
                    .toList();
            assertThat(allEvents).anyMatch(n -> n.equals("ContentBankCreatedDomainEvent"));
            assertThat(allEvents).anyMatch(n -> n.equals("ContentBankEntriesUpdatedDomainEvent"));
        }

        @Test
        @SuppressWarnings("unchecked")
        void duplicate_withProvidedUniqueName_createsNewBank() {
            // Given
            ContentBank original = new ContentBank(contentBankId, userId, "Original Bank");
            when(contentBankRepository.findByIdAndUserId(contentBankId, userId)).thenReturn(Optional.of(original));
            when(contentBankRepository.findByUserIdAndName(eq(userId), eq("My Copy"))).thenReturn(Optional.empty());
            when(contentBankRepository.save(any(ContentBank.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            // When
            contentBankService.duplicate(userId, contentBankId, "My Copy");

            // Then
            verify(contentBankRepository, atLeastOnce()).save(any(ContentBank.class));
            verify(contentEntryRepository, times(1)).saveAll(anyList());

            var aggregateTypeCaptor = ArgumentCaptor.forClass(String.class);
            var eventsCaptor = ArgumentCaptor.forClass(List.class);
            verify(eventBus, times(1)).publish(aggregateTypeCaptor.capture(), eventsCaptor.capture());
            var allEvents = eventsCaptor.getAllValues().stream()
                    .flatMap(list -> ((List<?>) list).stream())
                    .map(e -> e.getClass().getSimpleName())
                    .toList();
            assertThat(allEvents).anyMatch(n -> n.equals("ContentBankCreatedDomainEvent"));
            assertThat(allEvents).anyMatch(n -> n.equals("ContentBankEntriesUpdatedDomainEvent"));
        }
    }
}