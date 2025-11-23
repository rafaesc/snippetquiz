package ai.snippetquiz.core_service.contentbank.domain.events;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventsInformation;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class TopicsAddedIntegrationEventSerdeTest {

    @Test
    void deserialize_reconstructs_topics_added_integration_event() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        String occurredOn = "2024-01-01T00:00:00";
        int version = 0;
        List<String> topics = List.of("java", "spring");

        HashMap<String, Serializable> attributes = new HashMap<>();
        attributes.put("aggregate_id", aggregateId.toString());
        attributes.put("user_id", userId.toString());
        attributes.put("topics", Utils.toJson(topics));

        HashMap<String, Serializable> data = new HashMap<>();
        data.put("event_id", eventId.toString());
        data.put("version", version);
        data.put("type", Utils.getEventName(TopicsAddedIntegrationEvent.class));
        data.put("occurred_on", occurredOn);
        data.put("attributes", attributes);

        HashMap<String, Serializable> root = new HashMap<>();
        root.put("data", data);
        root.put("meta", new HashMap<>());

        String json = Utils.toJson(root);

        EventsInformation info = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(info);

        var result = deserializer.deserialize(json);

        assertNotNull(result);
        assertInstanceOf(TopicsAddedIntegrationEvent.class, result);
        var reconstructed = (TopicsAddedIntegrationEvent) result;
        assertEquals(aggregateId, reconstructed.getAggregateId());
        assertEquals(userId, reconstructed.getUserId());
        assertEquals(eventId, reconstructed.getEventId());
        assertEquals(occurredOn, reconstructed.getOccurredOn());
        assertEquals(topics, reconstructed.getTopics());
    }
}