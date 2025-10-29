package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentBankRenamedDomainEvent extends DomainEvent {
    private final String userId;
    private final String name;
    private final String updatedAt;

    public ContentBankRenamedDomainEvent(String aggregateId, String userId, String name, String updatedAt) {
        super(aggregateId);
        this.userId = userId;
        this.name = name;
        this.updatedAt = updatedAt;
    }

    public ContentBankRenamedDomainEvent(String aggregateId, String eventId, String occurredOn,
            String userId, String name, String updatedAt) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
        this.name = name;
        this.updatedAt = updatedAt;
    }

    @Override
    public String eventName() {
        return "content_bank.renamed";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        primitives.put("name", name);
        primitives.put("updatedAt", updatedAt);
        return primitives;
    }

    @Override
    public ContentBankRenamedDomainEvent fromPrimitives(String aggregateId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankRenamedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"),
                (String) body.get("name"),
                (String) body.get("updatedAt"));
    }
}
