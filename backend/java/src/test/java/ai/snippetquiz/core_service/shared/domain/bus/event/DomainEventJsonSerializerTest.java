package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.testing.events.FirstTestEvent;
import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DomainEventJsonSerializerTest {

    @Test
    @SuppressWarnings("unchecked")
    void serialize_includes_expected_fields() {
        // Arrange
        FirstTestEvent event = new FirstTestEvent(java.util.UUID.randomUUID(), java.util.UUID.randomUUID());

        // Act
        String json = DomainEventJsonSerializer.serialize(event);

        // Assert
        HashMap<String, Serializable> eventData = Utils.fromJson(json, new TypeReference<>() {});
        HashMap<String, Serializable> data = (HashMap<String, Serializable>) eventData.get("data");
        HashMap<String, Serializable> attributes = (HashMap<String, Serializable>) data.get("attributes");

        assertNotNull(data);
        assertNotNull(attributes);

        assertEquals(FirstTestEvent.eventName(), data.get("type"));
        assertEquals(event.getEventId().toString(), data.get("event_id"));
        assertEquals(event.getOccurredOn(), data.get("occurred_on"));

        assertEquals(event.getAggregateId().toString(), attributes.get("aggregate_id"));
        assertEquals(event.getUserId().toString(), attributes.get("user_id"));
    }
}