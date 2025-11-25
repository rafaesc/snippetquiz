package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryDeletedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryQuestionCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryTopicAddedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.YoutubeChannelId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContentEntryTest {

    private UserId userId;
    private ContentBankId contentBankId;
    private final ContentType contentType = ContentType.FULL_HTML;
    private final String content = "This is the content";
    private final String sourceUrl = "http://example.com";
    private final String pageTitle = "Example Page";
    private final Integer videoDuration = 120;
    private final String youtubeVideoId = "youtube123";
    private YoutubeChannel youtubeChannel;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userId = new UserId(UUID.randomUUID());
        contentBankId = new ContentBankId(UUID.randomUUID());
        youtubeChannel = new YoutubeChannel("channelId", "channelName", "avatarUrl");
        youtubeChannel.setId(new YoutubeChannelId(1L));
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void constructor_initializesFieldsCorrectly() {
        ContentEntry contentEntry = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);

        assertNotNull(contentEntry.getId());
        assertEquals(userId, contentEntry.getUserId());
        assertEquals(contentBankId, contentEntry.getContentBankId());
        assertEquals(contentType, contentEntry.getContentType());
        assertEquals(content, contentEntry.getContent());
        assertEquals(sourceUrl, contentEntry.getSourceUrl());
        assertEquals(pageTitle, contentEntry.getPageTitle());
        assertEquals(videoDuration, contentEntry.getVideoDuration());
        assertEquals(youtubeVideoId, contentEntry.getYoutubeVideoId());
        assertEquals(youtubeChannel.getId(), contentEntry.getYoutubeChannelId());
        assertNotNull(contentEntry.getCreatedAt());
        assertFalse(contentEntry.getQuestionsGenerated());
        assertTrue(contentEntry.getWordCount() > 0);

        var createdEvent = contentEntry.pullUncommittedChanges().stream()
                .filter(e -> e instanceof ContentEntryCreatedDomainEvent)
                .map(e -> (ContentEntryCreatedDomainEvent) e)
                .findFirst()
                .orElse(null);
        assertNotNull(createdEvent);
        assertFalse(createdEvent.isDuplicated());

    }

    @Test
    void update_recordsEvent_and_updatesContent() {
        ContentEntry contentEntry = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);
        String updatedContent = "This is the updated content";
        String updatedPageTitle = "Updated Example Page";

        contentEntry.update(updatedContent, updatedPageTitle);

        assertEquals(updatedContent, contentEntry.getContent());
        assertEquals(updatedPageTitle, contentEntry.getPageTitle());
        assertTrue(contentEntry.pullUncommittedChanges().stream()
                .anyMatch(event -> event instanceof ContentEntryUpdatedDomainEvent));
    }

    @Test
    void delete_recordsEvent() {
        ContentEntry contentEntry = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);
        contentEntry.delete();
        assertTrue(contentEntry.pullUncommittedChanges().stream()
                .anyMatch(event -> event instanceof ContentEntryDeletedDomainEvent));
    }

    @Test
    void updatedTopics_recordsEvent() {
        ContentEntry contentEntry = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);
        Topic topic = new Topic(userId, "New Topic");
        List<Topic> topics = Collections.singletonList(topic);

        contentEntry.updatedTopics(topics);

        assertTrue(contentEntry.pullUncommittedChanges().stream()
                .anyMatch(event -> event instanceof ContentEntryTopicAddedDomainEvent));
    }

    @Test
    void serialization_succeeds() throws JsonProcessingException {
        ContentEntry contentEntry = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);
        String json = objectMapper.writeValueAsString(contentEntry);
        assertNotNull(json);
        assertTrue(json.contains(content));
    }

    @Test
    void questionsGenerated_recordsEvent_and_setsFlag_without_duplicates() {
        ContentEntry contentEntry = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);

        contentEntry.questionsGenerated();

        assertTrue(contentEntry.getQuestionsGenerated());
        assertTrue(contentEntry.pullUncommittedChanges().stream()
                .anyMatch(event -> event instanceof ContentEntryQuestionCreatedDomainEvent));

        int sizeBefore = contentEntry.pullUncommittedChanges().size();
        contentEntry.questionsGenerated();
        int sizeAfter = contentEntry.pullUncommittedChanges().size();
        assertEquals(sizeBefore, sizeAfter);
    }

    @Test
    void duplicateConstructor_recordsCreatedEvent_and_copiesFields_toNewBank() {
        ContentEntry source = new ContentEntry(userId, contentBankId, contentType, content, sourceUrl, pageTitle,
                videoDuration, youtubeVideoId, youtubeChannel);

        source.updatedTopics(List.of(new Topic(source.getUserId(), "bank"), new Topic(source.getUserId(), "demo")));
        ContentBankId targetBankId = new ContentBankId(UUID.randomUUID());

        ContentEntry duplicated = new ContentEntry(source, targetBankId);

        assertNotNull(duplicated.getId());
        assertNotEquals(duplicated.getId(), source.getId());
        assertEquals(targetBankId, duplicated.getContentBankId());
        assertEquals(source.getContentType(), duplicated.getContentType());
        assertEquals(source.getContent(), duplicated.getContent());
        assertEquals(source.getSourceUrl(), duplicated.getSourceUrl());
        assertEquals(source.getPageTitle(), duplicated.getPageTitle());
        assertEquals(source.getStatus(), duplicated.getStatus());
        assertEquals(source.getWordCount(), duplicated.getWordCount());
        assertEquals(source.getVideoDuration(), duplicated.getVideoDuration());
        assertEquals(source.getYoutubeVideoId(), duplicated.getYoutubeVideoId());
        assertEquals(source.getYoutubeChannelId(), duplicated.getYoutubeChannelId());

        var createdEvent = duplicated.pullUncommittedChanges().stream()
                .filter(e -> e instanceof ContentEntryCreatedDomainEvent)
                .map(e -> (ContentEntryCreatedDomainEvent) e)
                .findFirst()
                .orElse(null);
        assertNotNull(createdEvent);
        assertTrue(createdEvent.isDuplicated());

    }
}