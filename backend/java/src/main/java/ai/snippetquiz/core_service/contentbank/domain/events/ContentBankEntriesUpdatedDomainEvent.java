package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBankEntriesUpdatedDomainEvent extends DomainEvent {
    private String contentEntries;
    private LocalDateTime updatedAt;

    public ContentBankEntriesUpdatedDomainEvent(UUID aggregateId, UserId userId, String contentEntries, LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue());
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public ContentBankEntriesUpdatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            int version,
            String contentEntries, LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public static String eventName() {
        return "content_bank.entries_updated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("content_entries", contentEntries);
        primitives.put("updated_at", Utils.dateToString(updatedAt));
        return primitives;
    }

    @Override
    public ContentBankEntriesUpdatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            int version) {
        return new ContentBankEntriesUpdatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("content_entries"),
                Utils.stringToDate((String) body.get("updated_at")));
    }
}
