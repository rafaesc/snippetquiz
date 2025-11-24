package ai.snippetquiz.core_service.contentbank.domain.events;

import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AuthUserVerifiedIntegrationEvent extends IntegrationEvent {

    public AuthUserVerifiedIntegrationEvent(
            UUID aggregateId,
            UUID eventId,
            String occurredOn,
            Integer version) {
        super(aggregateId, aggregateId, eventId, occurredOn, version);
    }

    public static String eventName() {
        return "auth.user.verified";
    }

    @Override
    public AuthUserVerifiedIntegrationEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new AuthUserVerifiedIntegrationEvent(
                aggregateId,
                eventId,
                occurredOn,
                version);
    }
}
