package ai.snippetquiz.core_service.contentbank.domain.events;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBankEntriesUpdatedDomainEvent extends DomainEvent {
    private List<ContentEntry> contentEntries;
    private LocalDateTime updatedAt;

    public ContentBankEntriesUpdatedDomainEvent(UUID aggregateId, UserId userId, List<ContentEntry> contentEntries, LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue());
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public ContentBankEntriesUpdatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            List<ContentEntry> contentEntries,
            LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.contentEntries = contentEntries;
        this.updatedAt = updatedAt;
    }

    public static String eventName() {
        return "content_bank.entries_updated";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("content_entries", contentEntries.stream().map(ContentEntry::getId).map(ContentEntryId::toString).toList());
        primitives.put("updated_at", Utils.dateToString(updatedAt));
        return primitives;
    }

    @Override
    public ContentBankEntriesUpdatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new ContentBankEntriesUpdatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                Utils.toMap(body.get("content_entries"), new TypeReference<List<String>>() {
                }).stream().map(contentEntryId -> {
                    var contentEntry = new ContentEntry();
                    contentEntry.setId(ContentEntryId.map(contentEntryId));
                    return contentEntry;
                }).toList(),
                Utils.stringToDate((String) body.get("updated_at")));
    }
}
