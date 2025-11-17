package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.testing.events.SecondTestEvent;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DomainEventJsonDeserializerTest {

    @Test
    void deserialize_reconstructs_event_instance() throws Exception {
        // Arrange
        var valueObject = UUID.randomUUID().toString();
        SecondTestEvent original = new SecondTestEvent(UUID.randomUUID(), UUID.randomUUID(), valueObject);
        String json = DomainEventJsonSerializer.serialize(original);

        DomainEventsInformation info = new DomainEventsInformation();
        DomainEventJsonDeserializer deserializer = new DomainEventJsonDeserializer(info);

        // Act
        DomainEvent result = deserializer.deserialize(json);

        // Assert
        assertNotNull(result);
        assertInstanceOf(SecondTestEvent.class, result);
        var reconstructed = (SecondTestEvent) result;
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
        assertEquals(original.getValueObject(), reconstructed.getValueObject());
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