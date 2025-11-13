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
    void serialize_includes_expected_fields() {
        // Arrange
        FirstTestEvent event = new FirstTestEvent("agg-1", "user-1");

        // Act
        String json = DomainEventJsonSerializer.serialize(event);

        // Assert
        HashMap<String, Serializable> eventData = Utils.fromJson(json, new TypeReference<>() {});
        HashMap<String, Serializable> data = (HashMap<String, Serializable>) eventData.get("data");
        HashMap<String, Serializable> attributes = (HashMap<String, Serializable>) data.get("attributes");

        assertNotNull(data);
        assertNotNull(attributes);

        assertEquals(FirstTestEvent.eventName(), data.get("type"));
        assertEquals(event.eventId(), data.get("id"));
        assertEquals(event.occurredOn(), data.get("occurred_on"));

        assertEquals(event.aggregateId(), attributes.get("id"));
        assertEquals(event.getUserId(), attributes.get("userId"));
    }
}