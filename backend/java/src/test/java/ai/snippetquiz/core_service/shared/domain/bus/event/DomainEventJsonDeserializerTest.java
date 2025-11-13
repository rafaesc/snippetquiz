package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.adapter.in.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.testing.events.SecondTestEvent;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

class DomainEventJsonDeserializerTest {

    @Test
    void deserialize_reconstructs_event_instance() throws Exception {
        // Arrange
        SecondTestEvent original = new SecondTestEvent("agg-2", "user-2");
        String json = DomainEventJsonSerializer.serialize(original);

        DomainEventsInformation info = new DomainEventsInformation();
        DomainEventJsonDeserializer deserializer = new DomainEventJsonDeserializer(info);

        // Act
        DomainEvent result = deserializer.deserialize(json);

        // Assert
        assertNotNull(result);
        assertInstanceOf(SecondTestEvent.class, result);
        assertEquals(original.aggregateId(), result.aggregateId());
        assertEquals(original.getUserId(), result.getUserId());
        assertEquals(original.eventId(), result.eventId());
        assertEquals(original.occurredOn(), result.occurredOn());
    }

    @Test
    void deserialize_throws_for_unknown_type() {
        // Arrange: craft a body with an unknown event type
        HashMap<String, Serializable> root = new HashMap<>();
        HashMap<String, Serializable> data = new HashMap<>();
        HashMap<String, Serializable> attributes = new HashMap<>();

        attributes.put("id", "agg-x");
        attributes.put("userId", "user-x");

        data.put("id", "event-x");
        data.put("type", "non.existent.event");
        data.put("occurred_on", "2024-01-01T00:00:00");
        data.put("attributes", attributes);

        root.put("data", data);
        root.put("meta", new HashMap<>());

        String json = Utils.toJson(root);

        DomainEventsInformation info = new DomainEventsInformation();
        DomainEventJsonDeserializer deserializer = new DomainEventJsonDeserializer(info);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> deserializer.deserialize(json));
    }
}