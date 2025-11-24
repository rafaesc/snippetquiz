package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.BaseEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("kafkaEventBus")
@Slf4j
@RequiredArgsConstructor
public class KafkaEventBusAdapter implements EventBus {
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public void publish(String aggregateType, List<? extends BaseEvent> events) {
        events.forEach(event -> publish(aggregateType, event));
    }

    private void publish(final String aggregateType, BaseEvent domainEvent) {
        try {
            log.info("Publishing domain event={} - aggregate_id={} - {} to topic={}", Utils.getEventName(domainEvent.getClass()), domainEvent.getAggregateId(), domainEvent.toPrimitives().toString(), aggregateType);
            String serializedDomainEvent =  DomainEventJsonSerializer.serialize((DomainEvent) domainEvent);

            kafkaTemplate
                    .send(aggregateType, domainEvent.getAggregateId().toString(), serializedDomainEvent)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish domain event: userId {}, {}", domainEvent.getUserId(), domainEvent, ex);
                        }
                    });

        } catch (Exception error) {
            log.error("Failed to publish domain event: userId {}, {}", domainEvent.getUserId(), domainEvent, error);
        }
    }
}
