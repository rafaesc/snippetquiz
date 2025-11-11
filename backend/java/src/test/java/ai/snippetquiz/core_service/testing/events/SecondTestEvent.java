package ai.snippetquiz.core_service.testing.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;

import java.io.Serializable;
import java.util.HashMap;

public class SecondTestEvent extends DomainEvent {

    public SecondTestEvent(String aggregateId, String userId) {
        super(aggregateId, userId);
    }

    public SecondTestEvent(String aggregateId, String userId, String eventId, String occurredOn) {
        super(aggregateId, userId, eventId, occurredOn);
    }

    public static String eventName() {
        return "test.second.event";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        return new HashMap<>();
    }

    @Override
    public DomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new SecondTestEvent(aggregateId, userId, eventId, occurredOn);
    }
}