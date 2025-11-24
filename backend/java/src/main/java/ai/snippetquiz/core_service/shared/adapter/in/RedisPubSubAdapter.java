package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.bus.event.BaseEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service("redisEventBus")
@RequiredArgsConstructor
@Slf4j
public class RedisPubSubAdapter implements EventBus {
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void publish(String aggregateType, List<? extends BaseEvent> events) {
        events.forEach(event -> publish(aggregateType, event));
    }

    public void publish(final String aggregateType, BaseEvent domainEvent) {
        UUID userId = domainEvent.getUserId();
        String channel = aggregateType + ":user-id:" + userId;
        try {
            log.info("Publishing redis domain event={} - {}", channel, domainEvent.toPrimitives().toString());
            redisTemplate.convertAndSend(channel, domainEvent.toPrimitives());
        } catch (Exception error) {
            log.error("Failed to publish redis domain event: userId {}", domainEvent.getUserId(), error);
        }
    }
}
