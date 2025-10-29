package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentBankEntriesUpdatedDomainEvent extends DomainEvent {
    private final String userId;
    private final String contentEntries;
    private final String updatedAt;

    public ContentBankEntriesUpdatedDomainEvent(String aggregateId, String userId, String contentEntries, String updatedAt) {
        super(aggregateId);
        this.userId = userId;
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public ContentBankEntriesUpdatedDomainEvent(String aggregateId, String userId, String eventId, String occurredOn,
            String contentEntries, String updatedAt) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    @Override
    public String eventName() {
        return "content_bank.entries_updated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        primitives.put("contentEntries", contentEntries);
        primitives.put("updatedAt", updatedAt);
        return primitives;
    }

    @Override
    public ContentBankEntriesUpdatedDomainEvent fromPrimitives(String aggregateId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankEntriesUpdatedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"),
                (String) body.get("contentEntries"),
                (String) body.get("updatedAt"));
    }
}
