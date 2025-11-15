package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.util.List;

public interface EventBus {
    void publish(final String aggregateType, final List<? extends DomainEvent> events);
}
