package ai.snippetquiz.core_service.contentbank.domain.events;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventsInformation;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AuthUserVerifiedIntegrationEventSerdeTest {

    @Test
    void deserialize_reconstructs_auth_user_verified_integration_event() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UUID userId = aggregateId;
        UUID eventId = UUID.randomUUID();
        String occurredOn = "2024-01-01T00:00:00";
        int version = 0;

        HashMap<String, Object> attributes = new HashMap<>();
        attributes.put("aggregate_id", aggregateId.toString());
        attributes.put("user_id", userId.toString());

        HashMap<String, Serializable> data = new HashMap<>();
        data.put("event_id", eventId.toString());
        data.put("version", version);
        data.put("type", Utils.getEventName(AuthUserVerifiedIntegrationEvent.class));
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
        assertInstanceOf(AuthUserVerifiedIntegrationEvent.class, result);
        var reconstructed = (AuthUserVerifiedIntegrationEvent) result;
        assertEquals(aggregateId, reconstructed.getAggregateId());
        assertEquals(userId, reconstructed.getUserId());
        assertEquals(eventId, reconstructed.getEventId());
        assertEquals(occurredOn, reconstructed.getOccurredOn());
    }
}
