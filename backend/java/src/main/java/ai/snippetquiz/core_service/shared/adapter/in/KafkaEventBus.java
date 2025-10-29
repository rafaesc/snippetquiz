package ai.snippetquiz.core_service.shared.adapter.in;

import java.util.List;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaEventBus implements EventBus {
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Override
    public void publish(List<DomainEvent> events) {
        events.forEach(this::publish);
    }

    private void publish(DomainEvent domainEvent) {
        try {
            //TODO:
        } catch (Exception error) {
            log.error("Failed to publish domain event: {}", domainEvent, error);
        }
    }
    
}
