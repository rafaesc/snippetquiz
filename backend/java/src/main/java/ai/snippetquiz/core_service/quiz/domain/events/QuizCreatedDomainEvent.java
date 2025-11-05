package ai.snippetquiz.core_service.quiz.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class QuizCreatedDomainEvent extends DomainEvent {
    private final String userId;
    private final String contentBankId;
    private final String createdAt;
    private final String bankName;
    private final QuizStatus status;
    private final Integer contentEntriesCount;

    public QuizCreatedDomainEvent(
            String aggregateId,
            String userId,
            String contentBankId,
            String bankName,
            String createdAt,
            Integer contentEntriesCount,
            Integer questionsCount,
            Integer questionsCompleted,
            QuizStatus status) {
        super(aggregateId);
        this.userId = userId;
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.createdAt = createdAt;
        this.contentEntriesCount = contentEntriesCount;
        this.status = status;
    }

    public QuizCreatedDomainEvent(String aggregateId, String eventId, String occurredOn,
            String userId, String contentBankId, String bankName, String createdAt,
            Integer contentEntriesCount,
            QuizStatus status) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.createdAt = createdAt;
        this.contentEntriesCount = contentEntriesCount;
        this.status = status;
    }

    @Override
    public String eventName() {
        return "quiz.created";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        primitives.put("contentBankId", contentBankId);
        primitives.put("bankName", bankName);
        primitives.put("createdAt", createdAt);
        primitives.put("contentEntriesCount", contentEntriesCount);
        primitives.put("status", status);
        return primitives;
    }

    @Override
    public QuizCreatedDomainEvent fromPrimitives(String aggregateId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new QuizCreatedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"),
                (String) body.get("contentBankId"),
                (String) body.get("bankName"),
                (String) body.get("createdAt"),
                (Integer) body.get("contentEntriesCount"),
                (QuizStatus) body.get("status"));
    }
}
