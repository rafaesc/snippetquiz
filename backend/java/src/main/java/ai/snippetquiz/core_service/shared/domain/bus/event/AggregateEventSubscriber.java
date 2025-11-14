package ai.snippetquiz.core_service.shared.domain.bus.event;

public interface AggregateEventSubscriber {
    void on(DomainEvent event);
}