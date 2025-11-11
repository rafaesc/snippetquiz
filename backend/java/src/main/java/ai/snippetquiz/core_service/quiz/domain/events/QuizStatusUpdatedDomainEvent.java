package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.io.Serializable;
import java.util.HashMap;

@Getter
@EqualsAndHashCode(callSuper = true)
public class QuizStatusUpdatedDomainEvent extends DomainEvent {
    private final QuizStatus status;

    public QuizStatusUpdatedDomainEvent(String aggregateId, UserId userId, QuizStatus status) {
        super(aggregateId, userId.toString());
        this.status = status;
    }

    public QuizStatusUpdatedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn, QuizStatus status) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
        this.status = status;
    }

    public static String eventName() {
        return "quiz.status.updated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("status", status);
        return primitives;
    }

    @Override
    public QuizStatusUpdatedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
                                                       String eventId,
                                                       String occurredOn) {
        return new QuizStatusUpdatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                (QuizStatus) body.get("status"));
    }
}
