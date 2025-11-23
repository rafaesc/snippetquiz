package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.testing.events.SecondTestEvent;
import ai.snippetquiz.core_service.testing.events.IntegrationTestEvent;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EventJsonDeserializerTest {

    @Test
    void deserialize_reconstructs_event_instance() throws Exception {
        // Arrange
        var valueObject = UUID.randomUUID().toString();
        SecondTestEvent original = new SecondTestEvent(UUID.randomUUID(), UUID.randomUUID(), valueObject);
        String json = DomainEventJsonSerializer.serialize(original);

        EventsInformation info = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(info);

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
    void deserialize_reconstructs_integration_event_instance() throws Exception {
        var valueObject = UUID.randomUUID().toString();
        IntegrationTestEvent original = new IntegrationTestEvent(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                "2024-01-01T00:00:00",
                0,
                valueObject
        );

        HashMap<String, Serializable> attributes = new HashMap<>();
        attributes.put("value_object", original.getValueObject());
        attributes.put("aggregate_id", original.getAggregateId());
        attributes.put("user_id", original.getUserId());

        HashMap<String, Serializable> data = new HashMap<>();
        data.put("event_id", original.getEventId());
        data.put("version", original.getVersion());
        data.put("type", Utils.getEventName(IntegrationTestEvent.class));
        data.put("occurred_on", original.getOccurredOn());
        data.put("attributes", attributes);

        HashMap<String, Serializable> root = new HashMap<>();
        root.put("data", data);
        root.put("meta", new HashMap<>());

        String json = Utils.toJson(root);

        EventsInformation info = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(info);

        BaseEvent result = deserializer.deserialize(json);

        assertNotNull(result);
        assertInstanceOf(IntegrationTestEvent.class, result);
        var reconstructed = (IntegrationTestEvent) result;
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

        EventsInformation info = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(info);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> deserializer.deserialize(json));
    }
}