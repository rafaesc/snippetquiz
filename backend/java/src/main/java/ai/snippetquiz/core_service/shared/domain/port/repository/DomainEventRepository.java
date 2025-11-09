package ai.snippetquiz.core_service.shared.domain.port.repository;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import java.util.List;

public interface DomainEventRepository<T extends DomainEvent> {
    List<T> findAllByUserIdAndAggregateIdAndAggregateType(UserId userId, String aggregateId);

    T save(UserId userId, String aggregateId, String aggregateType, T domainEvent);
}
