package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

public abstract class IntegrationEvent extends BaseEvent {
    public IntegrationEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
            String occurredOn,
            Integer version
    ) {
        super(aggregateId, userId, eventId, occurredOn, version);
    }

    protected IntegrationEvent() {
        super();
    }

    public abstract IntegrationEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version
    );
}