package ai.snippetquiz.core_service.contentbank.domain.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventsInformation;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SuppressWarnings("unchecked")
class ContentBankEventsJsonSerdeTest {

    private <T extends DomainEvent> T roundtrip(T event) throws Exception {
        EventsInformation info = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(info);

        String json = DomainEventJsonSerializer.serialize(event);
        DomainEvent deserialized = deserializer.deserialize(json);
        assertNotNull(deserialized);
        //noinspection unchecked
        return (T) deserialized;
    }

    @Test
    void roundtrip_ContentBankCreated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String name = "My Content Bank";
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 2, 3, 4, 5);

        ContentBankCreatedDomainEvent original =
                new ContentBankCreatedDomainEvent(aggregateId, userId, name, createdAt);

        ContentBankCreatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentBankCreatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
        assertEquals(name, reconstructed.getName());
        assertEquals(createdAt, reconstructed.getCreatedAt());
    }

    @Test
    void roundtrip_ContentBankDeleted() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());

        ContentBankDeletedDomainEvent original =
                new ContentBankDeletedDomainEvent(aggregateId, userId);

        ContentBankDeletedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentBankDeletedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
    }

    @Test
    void roundtrip_ContentBankEntriesUpdated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String contentEntries = "[{\"id\":\"e1\"},{\"id\":\"e2\"}]";
        LocalDateTime updatedAt = LocalDateTime.of(2024, 2, 3, 4, 5, 6);

        ContentBankEntriesUpdatedDomainEvent original =
                new ContentBankEntriesUpdatedDomainEvent(aggregateId, userId, contentEntries, updatedAt);

        ContentBankEntriesUpdatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentBankEntriesUpdatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
        assertEquals(contentEntries, reconstructed.getContentEntries());
        assertEquals(updatedAt, reconstructed.getUpdatedAt());
    }

    @Test
    void roundtrip_ContentBankRenamed() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String name = "Renamed Content Bank";
        LocalDateTime updatedAt = LocalDateTime.of(2024, 5, 6, 7, 8, 9);

        ContentBankRenamedDomainEvent original =
                new ContentBankRenamedDomainEvent(aggregateId, userId, name, updatedAt);

        ContentBankRenamedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentBankRenamedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
        assertEquals(name, reconstructed.getName());
        assertEquals(updatedAt, reconstructed.getUpdatedAt());
    }

    @Test
    void roundtrip_ContentEntryCreated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String contentBankId = "cb-123";
        String contentType = "article";
        String content = "Hello world!";
        String sourceUrl = "https://example.com/page";
        String pageTitle = "Example Title";
        LocalDateTime createdAt = LocalDateTime.of(2024, 3, 4, 5, 6, 7);
        Integer wordCount = 1234;
        Integer videoDuration = 456;
        String youtubeVideoId = "YTv123";
        Long youtubeChannelId = 9_876_543_210L; // ensure Long type on deserialize
        String existsTopics = "java,spring";

        ContentEntryCreatedDomainEvent original =
                new ContentEntryCreatedDomainEvent(
                        aggregateId,
                        userId,
                        contentBankId,
                        contentType,
                        content,
                        sourceUrl,
                        pageTitle,
                        createdAt,
                        wordCount,
                        videoDuration,
                        youtubeVideoId,
                        youtubeChannelId,
                        existsTopics,
                        false
                );

        ContentEntryCreatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentEntryCreatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());

        assertEquals(contentBankId, reconstructed.getContentBankId());
        assertEquals(contentType, reconstructed.getContentType());
        assertEquals(content, reconstructed.getContent());
        assertEquals(sourceUrl, reconstructed.getSourceUrl());
        assertEquals(pageTitle, reconstructed.getPageTitle());
        assertEquals(createdAt, reconstructed.getCreatedAt());
        assertEquals(wordCount, reconstructed.getWordCount());
        assertEquals(videoDuration, reconstructed.getVideoDuration());
        assertEquals(youtubeVideoId, reconstructed.getYoutubeVideoId());
        assertEquals(youtubeChannelId, reconstructed.getYoutubeChannelId());
        assertEquals(existsTopics, reconstructed.getExistsTopics());
        assertFalse(reconstructed.isDuplicated());
    }

    @Test
    void roundtrip_ContentEntryQuestionCreated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());

        ContentEntryQuestionCreatedDomainEvent original =
                new ContentEntryQuestionCreatedDomainEvent(aggregateId, userId);

        ContentEntryQuestionCreatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentEntryQuestionCreatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
    }

    @Test
    void roundtrip_ContentEntryUpdated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String content = "Updated content";
        String pageTitle = "Updated Title";
        LocalDateTime createdAt = LocalDateTime.of(2024, 8, 7, 6, 5, 4);
        Integer wordCount = 789;

        ContentEntryUpdatedDomainEvent original =
                new ContentEntryUpdatedDomainEvent(aggregateId, userId, content, pageTitle, createdAt, wordCount);

        ContentEntryUpdatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentEntryUpdatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());

        assertEquals(content, reconstructed.getContent());
        assertEquals(pageTitle, reconstructed.getPageTitle());
        assertEquals(createdAt, reconstructed.getCreatedAt());
        assertEquals(wordCount, reconstructed.getWordCount());
    }

    @Test
    void roundtrip_ContentEntryTopicAdded() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String topics = "[\"java\",\"spring\"]";
        LocalDateTime updatedAt = LocalDateTime.of(2024, 9, 10, 11, 12, 13);

        ContentEntryTopicAddedDomainEvent original =
                new ContentEntryTopicAddedDomainEvent(aggregateId, userId, topics, updatedAt);

        ContentEntryTopicAddedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentEntryTopicAddedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
        assertEquals(topics, reconstructed.getTopics());
        assertEquals(updatedAt, reconstructed.getUpdatedAt());
    }

    @Test
    void roundtrip_ContentEntryDeleted() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());

        ContentEntryDeletedDomainEvent original =
                new ContentEntryDeletedDomainEvent(aggregateId, userId);

        ContentEntryDeletedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(ContentEntryDeletedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
    }
}