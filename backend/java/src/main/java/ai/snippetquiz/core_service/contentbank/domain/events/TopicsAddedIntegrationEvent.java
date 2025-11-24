package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TopicsAddedIntegrationEvent extends IntegrationEvent {
    private List<String> topics;

    public TopicsAddedIntegrationEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            List<String> topics
    ) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.topics = topics;
    }

    public static String eventName() {
        return "ai-processor.topics.added";
    }

    @Override
    public TopicsAddedIntegrationEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version
    ) {
        return new TopicsAddedIntegrationEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (List<String>) body.get("topics")
        );
    }
}