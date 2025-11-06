package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankDeletedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankEntriesUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentBankRenamedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBank extends AggregateRoot<ContentBankId> {
    private UserId userId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentEntry> contentEntries = List.of();

    public ContentBank(ContentBankId id, UserId userId, String name) {
        var now = LocalDateTime.now();
        record(new ContentBankCreatedDomainEvent(
            id.toString(),
            userId,
            name,
            Utils.dateToString(now)));
    }

    public void apply(ContentBankCreatedDomainEvent event) {
        this.setId(ContentBankId.map(event.getAggregateId()));
        this.userId = UserId.map(event.getUserId());
        this.name = event.getName();
        this.createdAt = Utils.stringToDate(event.getCreatedAt());
        this.updatedAt = Utils.stringToDate(event.getCreatedAt());
    }

    public void delete() {
        record(new ContentBankDeletedDomainEvent(
            getId().toString(),
            userId));
    }

    public void apply(ContentBankDeletedDomainEvent event) {
        deactivate();
    }

    public void rename(String name) {
        var now = LocalDateTime.now();
        record(new ContentBankRenamedDomainEvent(
            getId().toString(),
            userId,
            name,
            Utils.dateToString(now)));
    }

    public void apply(ContentBankRenamedDomainEvent event) {
        this.name = event.getName();
        this.updatedAt = Utils.stringToDate(event.getUpdatedAt());
    }

    public void updatedContentEntries(List<ContentEntry> contentEntries) {
        var now = LocalDateTime.now();
        record(new ContentBankEntriesUpdatedDomainEvent(
            getId().toString(),
            userId,
            ContentEntry.toJson(new HashSet<>(contentEntries)),
            Utils.dateToString(now)));
    }

    public void apply(ContentBankEntriesUpdatedDomainEvent event) {
        this.contentEntries = new ArrayList<>(ContentEntry.fromJson(event.getContentEntries()));
        this.updatedAt = Utils.stringToDate(event.getUpdatedAt());
    }

    public void addContentEntry(ContentEntry contentEntry) {
        var contentEntries = this.getContentEntries();
        contentEntries.add(contentEntry);

        updatedContentEntries(contentEntries);
    }

    public void removeContentEntry(ContentEntry contentEntry) {
        var contentEntries = this.getContentEntries();
        contentEntries.remove(contentEntry);

        updatedContentEntries(contentEntries);
    }
}
