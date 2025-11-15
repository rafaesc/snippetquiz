package ai.snippetquiz.core_service.contentbank.domain.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SuppressWarnings("unchecked")
class ContentBankEventsJsonSerdeTest {

    private <T extends DomainEvent> T roundtrip(T event) throws Exception {
        DomainEventsInformation info = new DomainEventsInformation();
        DomainEventJsonDeserializer deserializer = new DomainEventJsonDeserializer(info);

        String json = DomainEventJsonSerializer.serialize(event);
        DomainEvent deserialized = deserializer.deserialize(json);
        assertNotNull(deserialized);
        //noinspection unchecked
        return (T) deserialized;
    }

    @Test
    void roundtrip_ContentBankCreated() throws Exception {
        String aggregateId = "content-bank-agg-1";
        UserId userId = UserId.map(UUID.randomUUID().toString());
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
        String aggregateId = "content-bank-agg-2";
        UserId userId = UserId.map(UUID.randomUUID().toString());

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
        String aggregateId = "content-bank-agg-3";
        UserId userId = UserId.map(UUID.randomUUID().toString());
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
        String aggregateId = "content-bank-agg-4";
        UserId userId = UserId.map(UUID.randomUUID().toString());
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
        String aggregateId = "content-entry-agg-1";
        UserId userId = UserId.map(UUID.randomUUID().toString());
        String contentBankId = "cb-123";
        String contentType = "article";
        String content = "Hello world!";
        String sourceUrl = "https://example.com/page";
        String pageTitle = "Example Title";
        LocalDateTime createdAt = LocalDateTime.of(2024, 3, 4, 5, 6, 7);
        Integer wordCount = 1234;
        Integer videoDuration = 456;
        String youtubeVideoId = "YTv123";
        String youtubeChannelName = "SampleChannel";
        Long youtubeChannelId = 9_876_543_210L; // ensure Long type on deserialize

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
                        youtubeChannelName,
                        youtubeChannelId
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
        assertEquals(youtubeChannelName, reconstructed.getYoutubeChannelName());
        assertEquals(youtubeChannelId, reconstructed.getYoutubeChannelId());
    }

    @Test
    void roundtrip_ContentEntryUpdated() throws Exception {
        String aggregateId = "content-entry-agg-2";
        UserId userId = UserId.map(UUID.randomUUID().toString());
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
        String aggregateId = "content-entry-agg-3";
        UserId userId = UserId.map(UUID.randomUUID().toString());
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
        String aggregateId = "content-entry-agg-4";
        UserId userId = UserId.map(UUID.randomUUID().toString());

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