package ai.snippetquiz.core_service.testing.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.UUID;

@NoArgsConstructor
public class FirstTestEvent extends DomainEvent {

    public FirstTestEvent(UUID aggregateId, UUID userId) {
        super(aggregateId, userId);
    }

    public FirstTestEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
            String occurredOn,
            Integer version) {
        super(aggregateId, userId, eventId, occurredOn, version);
    }

    public static String eventName() {
        return "test.first.event";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        return new HashMap<>();
    }

    @Override
    public DomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new FirstTestEvent(aggregateId, userId, eventId, occurredOn, version);
    }
}