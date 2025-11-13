package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBankDeletedDomainEvent extends DomainEvent implements DeactivationDomainEvent {

    public ContentBankDeletedDomainEvent(String aggregateId, UserId userId) {
        super(aggregateId, userId.toString());
    }

    public ContentBankDeletedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
    }

    public static String eventName() {
        return "content_bank.deleted";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        return primitives;
    }

    @Override
    public ContentBankDeletedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankDeletedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn);
    }
}
