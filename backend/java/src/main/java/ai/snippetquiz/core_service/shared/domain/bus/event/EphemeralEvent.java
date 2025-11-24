package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.util.UUID;

public abstract class EphemeralEvent extends BaseEvent {
    public EphemeralEvent(UUID aggregateId, UUID userId) {
        super(aggregateId, userId);
    }
}
