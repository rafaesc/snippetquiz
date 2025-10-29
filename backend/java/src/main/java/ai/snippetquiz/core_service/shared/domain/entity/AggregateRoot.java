package ai.snippetquiz.core_service.shared.domain.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;

public abstract class AggregateRoot<ID> extends BaseEntity<ID> {
    private List<DomainEvent> domainEvents = new ArrayList<>();

    final public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = domainEvents;

        domainEvents = Collections.emptyList();

        return events;
    }

    final protected void record(DomainEvent event) {
        domainEvents.add(event);
    }
        
}
