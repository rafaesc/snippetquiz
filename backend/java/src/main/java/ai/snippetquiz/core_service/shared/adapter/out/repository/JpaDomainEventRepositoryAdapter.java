package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.core_service.shared.adapter.out.entities.DomainEventEntity;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.domain.port.repository.DomainEventRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

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
                    var DomainEventClass = domainEventsInformation.search(domainEventEntity.getEventName());

                    return (T) Utils.fromJson(domainEventEntity.getPayload(), DomainEventClass);
                })
                .toList();
    }

    @Override
    public T save(UserId userId, String aggregateId, String aggregateType, T domainEvent) {
        var domainEventEntity = new DomainEventEntity();
        domainEventEntity.setEventId(UUID.fromString(domainEvent.getEventId()));
        domainEventEntity.setUserId(userId.getValue());
        domainEventEntity.setAggregateId(UUID.fromString(aggregateId));
        domainEventEntity.setAggregateType(aggregateType);
        domainEventEntity.setVersion(domainEvent.getVersion());
        domainEventEntity.setOccurredOn(Utils.stringToDate(domainEvent.getOccurredOn()));
        domainEventEntity.setPayload(Utils.toJson(domainEvent));        
        domainEventEntity.setEventName(Utils.getEventName(domainEvent.getClass()));

        jpaDomainEventRepository.save(domainEventEntity);
        return domainEvent;
    }
}
