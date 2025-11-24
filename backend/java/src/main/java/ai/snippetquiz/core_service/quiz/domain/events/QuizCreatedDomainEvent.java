package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class QuizCreatedDomainEvent extends DomainEvent {
    private String contentBankId;
    private String bankName;
    private QuizStatus status;
    private LocalDateTime createdAt;
    private String instructions;
    private List<String> newContentEntries;
    private Integer entriesSkipped;

    public QuizCreatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            String contentBankId,
            String bankName,
            QuizStatus status,
            LocalDateTime createdAt,
            String instructions,
            List<String> newContentEntries,
            Integer entriesSkipped) {
        super(aggregateId, userId.getValue());
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.createdAt = createdAt;
        this.instructions = instructions;
        this.newContentEntries = newContentEntries;
        this.entriesSkipped = entriesSkipped;
    }

    public QuizCreatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String contentBankId, String bankName,
            QuizStatus status,
            LocalDateTime createdAt,
            String instructions,
            List<String> newContentEntries,
            Integer entriesSkipped) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.createdAt = createdAt;
        this.instructions = instructions;
        this.newContentEntries = newContentEntries;
        this.entriesSkipped = entriesSkipped;
    }

    public static String eventName() {
        return "quiz.created";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("content_bank_id", contentBankId);
        primitives.put("bank_name", bankName);
        primitives.put("status", status);
        primitives.put("created_at", Utils.dateToString(createdAt));
        primitives.put("instructions", instructions);
        primitives.put("new_content_entries", newContentEntries);
        primitives.put("entries_skipped", entriesSkipped);
        return primitives;
    }

    @Override
    public QuizCreatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new QuizCreatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("content_bank_id"),
                (String) body.get("bank_name"),
                QuizStatus.valueOf((String) body.get("status")),
                Utils.stringToDate((String) body.get("created_at")),
                (String) body.get("instructions"),
                (List<String>) body.get("new_content_entries"),
                (Integer) body.get("entries_skipped"));
    }
}
