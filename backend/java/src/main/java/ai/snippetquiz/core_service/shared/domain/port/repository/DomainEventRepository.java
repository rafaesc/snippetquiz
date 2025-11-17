package ai.snippetquiz.core_service.shared.domain.port.repository;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import java.util.List;
import java.util.UUID;

public interface DomainEventRepository<T extends DomainEvent> {
    List<T> findAllByUserIdAndAggregateIdAndAggregateType(UserId userId, UUID aggregateId);

    T save(UserId userId, UUID aggregateId, String aggregateType, T domainEvent);
}
