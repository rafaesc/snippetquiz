package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.bus.event.BaseEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EphemeralEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@Primary
public class SmartEventBusRouter implements EventBus {
    private final EventBus kafkaBus;
    private final EventBus redisBus;

    public SmartEventBusRouter(
            @Qualifier("kafkaEventBus") EventBus kafkaBus,
            @Qualifier("redisEventBus") EventBus redisBus) {
        this.kafkaBus = kafkaBus;
        this.redisBus = redisBus;
    }

    @Override
    public void publish(String aggregateType, List<? extends BaseEvent> events) {
        var ephemeralEvents = events.stream()
                .filter(event -> event instanceof EphemeralEvent).toList();
        var durableEvents = events.stream()
                .filter(event -> !(event instanceof EphemeralEvent)).toList();

        publish(true, aggregateType, ephemeralEvents);
        publish(false, aggregateType, durableEvents);
    }

    private void publish(final boolean isEphemeral, final String aggregateType,
            List<? extends BaseEvent> events) {
        if (isEphemeral) {
            redisBus.publish(aggregateType, events);
        } else {
            kafkaBus.publish(aggregateType, events);
        }
    }
}
