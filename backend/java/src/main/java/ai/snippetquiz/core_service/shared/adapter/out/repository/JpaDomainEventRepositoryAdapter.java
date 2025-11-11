package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.core_service.shared.adapter.in.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.adapter.out.entities.DomainEventEntity;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.port.repository.DomainEventRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static java.time.ZoneOffset.UTC;

@Component
@RequiredArgsConstructor
public class JpaDomainEventRepositoryAdapter<T extends DomainEvent> implements DomainEventRepository<T> {
    private final DomainEventsInformation  domainEventsInformation;
    private final JpaDomainEventRepository jpaDomainEventRepository;


    @SuppressWarnings("unchecked")
    @Override
    public List<T> findAllByUserIdAndAggregateIdAndAggregateType(UserId userId, String aggregateId) {
        var domainEventEntities = jpaDomainEventRepository.findAllByUserIdAndAggregateId(userId.getValue(), UUID.fromString(aggregateId));

        return domainEventEntities.stream()
                .map(domainEventEntity -> {
                    var DomainEventClass = domainEventsInformation.search(domainEventEntity.getEventId());

                    return (T) Utils.fromJson(domainEventEntity.getPayload(), DomainEventClass);
                })
                .toList();
    }

    @Override
    public T save(UserId userId, String aggregateId, String aggregateType, T domainEvent) {
        var now = LocalDateTime.now(UTC);
        var domainEventEntity = new DomainEventEntity();
        domainEventEntity.setUserId(userId.getValue());
        domainEventEntity.setAggregateId(UUID.fromString(aggregateId));
        domainEventEntity.setAggregateType(aggregateType);
        domainEventEntity.setEventId(domainEvent.eventId());
        domainEventEntity.setVersion(domainEvent.getVersion());
        domainEventEntity.setOccurredOn(now);
        domainEventEntity.setPayload(Utils.toJson(domainEvent));

        jpaDomainEventRepository.save(domainEventEntity);

        domainEvent.setOccurredOn(Utils.dateToString(now));
        return domainEvent;
    }
}
