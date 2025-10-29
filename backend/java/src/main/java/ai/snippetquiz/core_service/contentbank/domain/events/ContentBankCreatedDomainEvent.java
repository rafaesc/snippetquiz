package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentBankCreatedDomainEvent extends DomainEvent {
    private final String userId;
    private final String name;
    private final String createdAt;

    public ContentBankCreatedDomainEvent(String aggregateId, String userId, String name, String createdAt) {
        super(aggregateId);
        this.userId = userId;
        this.name = name;
        this.createdAt = createdAt;
    }

    public ContentBankCreatedDomainEvent(String aggregateId, String eventId, String occurredOn, 
            String userId, String name, String createdAt) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
        this.name = name;
        this.createdAt = createdAt;
    }

    @Override
    public String eventName() {
        return "content_bank.created";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        primitives.put("name", name);
        primitives.put("createdAt", createdAt);
        return primitives;
    }

    @Override
    public ContentBankCreatedDomainEvent fromPrimitives(String aggregateId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankCreatedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"),
                (String) body.get("name"),
                (String) body.get("createdAt"));
    }
}
