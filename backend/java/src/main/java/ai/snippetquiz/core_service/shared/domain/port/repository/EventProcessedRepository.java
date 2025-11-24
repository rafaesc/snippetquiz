package ai.snippetquiz.core_service.shared.domain.port.repository;

import ai.snippetquiz.core_service.shared.domain.bus.event.BaseEvent;
import java.util.UUID;

public interface EventProcessedRepository {
    <T extends BaseEvent> void save(T event);

    boolean isEventProcessed(UUID eventId);
}
