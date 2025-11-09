package ai.snippetquiz.core_service.shared.domain.service;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.port.repository.DomainEventRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventStore {
    private final DomainEventRepository<DomainEvent> domainEventRepository;

    public void saveEvents(UserId userId, String aggregateId, String aggregateType, Iterable<? extends DomainEvent> events, int expectedVersion){
        var eventStream = domainEventRepository.findAllByUserIdAndAggregateIdAndAggregateType(userId, aggregateId);
        if (expectedVersion != -1 && eventStream.getLast().getVersion() != expectedVersion) {
            throw new RuntimeException();
        }
        var version = expectedVersion;
        for (var event: events) {
            version++;
            event.setVersion(version);
            domainEventRepository.save(userId, aggregateId, aggregateType, event);
            //eventProducer.produce(event.getClass().getSimpleName(), event);
        }
    }

    public List<DomainEvent> getEvents(UserId userId, String aggregateId) {
        return domainEventRepository.findAllByUserIdAndAggregateIdAndAggregateType(userId, aggregateId);
    }
}
