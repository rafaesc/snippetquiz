package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import org.springframework.context.annotation.Primary;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Primary
public class KafkaEventBus implements EventBus {
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public void publish(String aggregateType, Iterable<? extends DomainEvent> events) {
        events.forEach(event -> publish(aggregateType, event));
    }

    private void publish(final String aggregateType, DomainEvent domainEvent) {
        try {
            log.info("Publishing domain event {} to topic {}", domainEvent.toPrimitives().toString(), aggregateType);
            String serializedDomainEvent =  DomainEventJsonSerializer.serialize(domainEvent);

            kafkaTemplate
                    .send(aggregateType, domainEvent.getAggregateId(), serializedDomainEvent)
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
