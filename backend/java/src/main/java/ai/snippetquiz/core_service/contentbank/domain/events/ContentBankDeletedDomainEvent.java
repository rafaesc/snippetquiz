package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentBankDeletedDomainEvent extends DomainEvent {
    private final String userId;

    public ContentBankDeletedDomainEvent(String aggregateId, String userId) {
        super(aggregateId);
        this.userId = userId;
    }

    public ContentBankDeletedDomainEvent(String aggregateId, String eventId, String occurredOn,
            String userId) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
    }

    @Override
    public String eventName() {
        return "content_bank.deleted";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        return primitives;
    }

    @Override
    public ContentBankDeletedDomainEvent fromPrimitives(String aggregateId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankDeletedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"));
    }
}
