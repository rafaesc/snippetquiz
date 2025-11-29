package ai.snippetquiz.core_service.contentbank.domain.events;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AITopicsAddedIntegrationEvent extends IntegrationEvent {
    private List<String> topics;

    public AITopicsAddedIntegrationEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            List<String> topics) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.topics = topics;
    }

    public static String eventName() {
        return "ai-content-service.topics.added";
    }

    @Override
    public AITopicsAddedIntegrationEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new AITopicsAddedIntegrationEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (List<String>) body.get("topics"));
    }
}