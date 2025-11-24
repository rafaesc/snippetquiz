package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
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
public class QuizDeletedDomainEvent extends DomainEvent implements DeactivationDomainEvent {

    public QuizDeletedDomainEvent(
            UUID aggregateId,
            UserId userId) {
        super(aggregateId, userId.getValue());
    }

    public QuizDeletedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
    }

    public static String eventName() {
        return "quiz.deleted";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        return new HashMap<>();
    }

    @Override
    public QuizDeletedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new QuizDeletedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version);
    }
}
