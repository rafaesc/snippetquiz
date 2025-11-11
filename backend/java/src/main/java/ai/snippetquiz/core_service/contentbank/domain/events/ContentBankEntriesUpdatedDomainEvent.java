package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentBankEntriesUpdatedDomainEvent extends DomainEvent {
    private final String contentEntries;
    private final LocalDateTime updatedAt;

    public ContentBankEntriesUpdatedDomainEvent(String aggregateId, UserId userId, String contentEntries, LocalDateTime updatedAt) {
        super(aggregateId, userId.toString());
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public ContentBankEntriesUpdatedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn,
            String contentEntries, LocalDateTime updatedAt) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public static String eventName() {
        return "content_bank.entries_updated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("contentEntries", contentEntries);
        primitives.put("updatedAt", Utils.dateToString(updatedAt));
        return primitives;
    }

    @Override
    public ContentBankEntriesUpdatedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentBankEntriesUpdatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                (String) body.get("contentEntries"),
                Utils.stringToDate((String) body.get("updatedAt")));
    }
}
