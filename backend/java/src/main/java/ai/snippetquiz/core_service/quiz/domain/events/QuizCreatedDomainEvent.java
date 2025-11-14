package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class QuizCreatedDomainEvent extends DomainEvent {
    private String contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;

    public QuizCreatedDomainEvent(
            String aggregateId,
            UserId userId,
            String contentBankId,
            String bankName,
            QuizStatus status,
            LocalDateTime createdAt) {
        super(aggregateId, userId.toString());
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.createdAt = createdAt;
    }

    public QuizCreatedDomainEvent(
            String aggregateId,
            UserId userId,
            String eventId,
            String occurredOn,
            int version,
            String contentBankId, String bankName,
            QuizStatus status,
            LocalDateTime createdAt) {
        super(aggregateId, userId.toString(), eventId, occurredOn, version);
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static String eventName() {
        return "quiz.created";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("contentBankId", contentBankId);
        primitives.put("bankName", bankName);
        primitives.put("status", status);
        primitives.put("createdAt", Utils.dateToString(createdAt));
        return primitives;
    }

    @Override
    public QuizCreatedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version) {
        return new QuizCreatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("contentBankId"),
                (String) body.get("bankName"),
                (QuizStatus) body.get("status"),
                Utils.stringToDate((String) body.get("createdAt")));
    }
}
