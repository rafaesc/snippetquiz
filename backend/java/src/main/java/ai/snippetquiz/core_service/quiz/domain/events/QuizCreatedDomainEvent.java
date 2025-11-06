package ai.snippetquiz.core_service.quiz.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class QuizCreatedDomainEvent extends DomainEvent {
    private final String contentBankId;
    private final String bankName;
    private final QuizStatus status;

    public QuizCreatedDomainEvent(
            String aggregateId,
            UserId userId,
            String contentBankId,
            String bankName,
            QuizStatus status) {
        super(aggregateId, userId.toString());
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
    }

    public QuizCreatedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn,
            String contentBankId, String bankName,
            QuizStatus status) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
    }

    @Override
    public String eventName() {
        return "quiz.created";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("contentBankId", contentBankId);
        primitives.put("bankName", bankName);
        primitives.put("status", status);
        return primitives;
    }

    @Override
    public QuizCreatedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new QuizCreatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                (String) body.get("contentBankId"),
                (String) body.get("bankName"),
                (QuizStatus) body.get("status"));
    }
}
