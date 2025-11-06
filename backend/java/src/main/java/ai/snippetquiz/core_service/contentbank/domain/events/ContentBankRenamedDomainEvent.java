package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentBankRenamedDomainEvent extends DomainEvent {
    private final String name;
    private final String updatedAt;

    public ContentBankRenamedDomainEvent(String aggregateId, UserId userId, String name, String updatedAt) {
        super(aggregateId, userId.toString());
        this.name = name;
        this.updatedAt = updatedAt;
    }

    public ContentBankRenamedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn,
            String name, String updatedAt) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
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
        primitives.put("name", name);
        primitives.put("updatedAt", updatedAt);
        return primitives;
    }

    @Override
    public ContentBankRenamedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankRenamedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                (String) body.get("name"),
                (String) body.get("updatedAt"));
    }
}
