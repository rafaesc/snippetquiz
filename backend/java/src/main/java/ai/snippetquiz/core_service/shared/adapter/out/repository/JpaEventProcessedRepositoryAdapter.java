package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.core_service.shared.adapter.out.entities.EventProcessedJpaEntity;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.BaseEvent;
import ai.snippetquiz.core_service.shared.domain.port.repository.EventProcessedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaEventProcessedRepositoryAdapter implements EventProcessedRepository {
    private final JpaEventProcessedRepository repository;

    @Override
    public <T extends BaseEvent> void save(T event) {
        EventProcessedJpaEntity entity = new EventProcessedJpaEntity(
                event.getEventId(),
                event.getUserId(),
                Utils.getEventName(event.getClass()));
        repository.save(entity);
    }

    @Override
    public boolean isEventProcessed(UUID eventId) {
        return repository.existsById(eventId);
    }
}
