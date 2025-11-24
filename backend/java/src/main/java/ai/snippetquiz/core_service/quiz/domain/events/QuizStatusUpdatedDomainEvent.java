package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class QuizStatusUpdatedDomainEvent extends DomainEvent {
    private QuizStatus status;

    public QuizStatusUpdatedDomainEvent(UUID aggregateId, UserId userId, QuizStatus status) {
        super(aggregateId, userId.getValue());
        this.status = status;
    }

    public QuizStatusUpdatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            QuizStatus status) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.status = status;
    }

    public static String eventName() {
        return "quiz.status.updated";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("status", status);
        return primitives;
    }

    @Override
    public QuizStatusUpdatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new QuizStatusUpdatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                QuizStatus.valueOf((String) body.get("status")));
    }
}
