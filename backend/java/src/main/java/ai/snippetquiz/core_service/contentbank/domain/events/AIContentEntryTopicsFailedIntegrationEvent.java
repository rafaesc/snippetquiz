package ai.snippetquiz.core_service.contentbank.domain.events;

import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AIContentEntryTopicsFailedIntegrationEvent extends IntegrationEvent {

    private String characterMessage;
    private String characterSpriteURL;
    private Integer characterSteps;
    private Integer characterAnimateTo;
    private Integer characterAnimateSeconds;

    public AIContentEntryTopicsFailedIntegrationEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String characterMessage,
            String characterSpriteURL,
            Integer characterSteps,
            Integer characterAnimateTo,
            Integer characterAnimateSeconds) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.characterMessage = characterMessage;
        this.characterSpriteURL = characterSpriteURL;
        this.characterSteps = characterSteps;
        this.characterAnimateTo = characterAnimateTo;
        this.characterAnimateSeconds = characterAnimateSeconds;
    }

    public static String eventName() {
        return "ai_content_entry.topics_failed";
    }

    @Override
    public AIContentEntryTopicsFailedIntegrationEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new AIContentEntryTopicsFailedIntegrationEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("character_message"),
                (String) body.get("character_sprite_url"),
                (Integer) body.get("character_steps"),
                (Integer) body.get("character_animate_to"),
                (Integer) body.get("character_animate_seconds"));
    }
}
