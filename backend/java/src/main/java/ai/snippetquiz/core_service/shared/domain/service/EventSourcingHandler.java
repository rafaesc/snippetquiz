package ai.snippetquiz.core_service.shared.domain.service;

import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import java.util.Optional;
import java.util.UUID;

public interface EventSourcingHandler<T extends AggregateRoot<?>> {
    void save(T aggregate);
    Optional<T> getById(UserId userId, UUID aggregateId);
}
