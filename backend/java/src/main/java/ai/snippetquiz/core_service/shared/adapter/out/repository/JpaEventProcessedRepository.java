package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.core_service.shared.adapter.out.entities.EventProcessedJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface JpaEventProcessedRepository extends JpaRepository<EventProcessedJpaEntity, UUID> {
}
