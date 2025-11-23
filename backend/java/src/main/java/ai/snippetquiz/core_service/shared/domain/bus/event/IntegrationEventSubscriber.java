package ai.snippetquiz.core_service.shared.domain.bus.event;

public interface IntegrationEventSubscriber {
    void on(IntegrationEvent event);
}