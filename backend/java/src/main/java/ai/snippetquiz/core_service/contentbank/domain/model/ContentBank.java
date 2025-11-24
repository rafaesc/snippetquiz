package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankDeletedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankEntriesUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankRenamedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBank extends AggregateRoot<ContentBankId> {
    private UserId userId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentEntry> contentEntries = List.of();

    public String aggregateType() {
        return "content-bank.events";
    }

    public ContentBank(ContentBankId id, UserId userId, String name) {
        var now = LocalDateTime.now();
        record(new ContentBankCreatedDomainEvent(
                id.getValue(),
                userId,
                name,
                now));
    }

    public void apply(ContentBankCreatedDomainEvent event) {
        this.setId(new ContentBankId(event.getAggregateId()));
        this.userId = new UserId(event.getUserId());
        this.name = event.getName();
        this.createdAt = event.getCreatedAt();
        this.updatedAt = event.getCreatedAt();
    }

    public void delete() {
        record(new ContentBankDeletedDomainEvent(
                getId().getValue(),
                userId));
    }

    public void apply(ContentBankDeletedDomainEvent event) {
        deactivate();
    }

    public void rename(String name) {
        var now = LocalDateTime.now();
        record(new ContentBankRenamedDomainEvent(
                getId().getValue(),
                userId,
                name,
                now));
    }

    public void apply(ContentBankRenamedDomainEvent event) {
        this.name = event.getName();
        this.updatedAt = event.getUpdatedAt();
    }

    public void updatedContentEntries(List<ContentEntry> contentEntries) {
        var now = LocalDateTime.now();
        record(new ContentBankEntriesUpdatedDomainEvent(
                getId().getValue(),
                userId,
                contentEntries,
                now));
    }

    public void apply(ContentBankEntriesUpdatedDomainEvent event) {
        this.contentEntries = event.getContentEntries();
        this.updatedAt = event.getUpdatedAt();
    }

    public void addContentEntry(ContentEntry contentEntry) {
        var newContentEntries = new ArrayList<>(this.contentEntries);
        newContentEntries.add(contentEntry);
        updatedContentEntries(newContentEntries);
    }

    public void removeContentEntry(ContentEntry contentEntry) {
        var newContentEntries = new ArrayList<>(this.contentEntries);
        newContentEntries.remove(contentEntry);
        updatedContentEntries(newContentEntries);
    }
}
