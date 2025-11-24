package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.util.HashMap;
import java.util.UUID;

public abstract class DomainEvent extends BaseEvent {
    public DomainEvent(UUID aggregateId, UUID userId) {
        super(aggregateId, userId);
    }

    public DomainEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
            String occurredOn,
            Integer version) {
        super(aggregateId, userId, eventId, occurredOn, version);
    }

    protected DomainEvent() {
        super();
    }

    public DomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
