package ai.snippetquiz.core_service.contentbank.domain.events;

import java.util.HashMap;
import java.util.UUID;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentEntryQuestionCreatedDomainEvent extends DomainEvent {

    public ContentEntryQuestionCreatedDomainEvent(
            UUID aggregateId,
            UserId userId) {
        super(aggregateId, userId.getValue());
    }

    public ContentEntryQuestionCreatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
    }

    public static String eventName() {
        return "content_entry.question.created";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        return new HashMap<String, Object>();
    }

    @Override
    public ContentEntryQuestionCreatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new ContentEntryQuestionCreatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version);
    }
}