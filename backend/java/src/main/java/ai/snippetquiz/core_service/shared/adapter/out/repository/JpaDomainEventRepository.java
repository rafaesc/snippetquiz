package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.core_service.shared.adapter.out.entities.DomainEventEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaDomainEventRepository extends JpaRepository<DomainEventEntity, UUID> {
    List<DomainEventEntity> findAllByUserIdAndAggregateId(UUID userId, UUID aggregateId, Sort sort);
}
