package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.core_service.shared.adapter.out.entities.DomainEventEntity;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.domain.port.repository.DomainEventRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaDomainEventRepositoryAdapter<T extends DomainEvent> implements DomainEventRepository<T> {
    private final DomainEventJsonDeserializer deserializer;
    private final JpaDomainEventRepository jpaDomainEventRepository;


    @SuppressWarnings("unchecked")
    @Override
    @SneakyThrows
    public List<T> findAllByUserIdAndAggregateIdAndAggregateType(UserId userId, UUID aggregateId) {
        var domainEventEntities = jpaDomainEventRepository.findAllByUserIdAndAggregateId(userId.getValue(), aggregateId);

        return domainEventEntities.stream()
                .map(domainEventEntity -> {
                    try {
                        return (T) deserializer.deserializePrimitives(
                                domainEventEntity.getEventId().toString(),
                                domainEventEntity.getUserId().toString(),
                                domainEventEntity.getAggregateId().toString(),
                                domainEventEntity.getEventName(),
                                Utils.dateToString(domainEventEntity.getOccurredOn()),
                                domainEventEntity.getVersion(),
                                domainEventEntity.getPayload()
                        );
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
    }

    @Override
    public T save(UserId userId, UUID aggregateId, String aggregateType, T domainEvent) {
        var domainEventEntity = new DomainEventEntity();
        domainEventEntity.setEventId(domainEvent.getEventId());
        domainEventEntity.setUserId(userId.getValue());
        domainEventEntity.setAggregateId(aggregateId);
        domainEventEntity.setAggregateType(aggregateType);
        domainEventEntity.setVersion(domainEvent.getVersion());
        domainEventEntity.setOccurredOn(Utils.stringToDate(domainEvent.getOccurredOn()));
        domainEventEntity.setPayload(DomainEventJsonSerializer.serializePrimitives(domainEvent));
        domainEventEntity.setEventName(Utils.getEventName(domainEvent.getClass()));

        jpaDomainEventRepository.save(domainEventEntity);
        return domainEvent;
    }
}
