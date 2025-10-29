package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
@AllArgsConstructor
@NoArgsConstructor
public class ContentBank extends AggregateRoot<ContentBankId> {
    private UserId userId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContentEntry> contentEntries = List.of();

    public static ContentBank create(ContentBankId id, UserId userId, String name) {
        var now = LocalDateTime.now();
        var contentBank = new ContentBank();
        contentBank.setId(id);
        contentBank.setUserId(userId);
        contentBank.setName(name);
        contentBank.setCreatedAt(now);
        contentBank.setUpdatedAt(now);

        contentBank.record(new ContentBankCreatedDomainEvent(
            id.toString(),
            userId.toString(),
            name,
            Utils.dateToString(now)));

        return contentBank;
    }

    public void delete() {
        record(new ContentBankDeletedDomainEvent(
            getId().toString(),
            userId.toString()));
    }

    public void rename(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
        record(new ContentBankRenamedDomainEvent(
            getId().toString(),
            userId.toString(),
            name,
            Utils.dateToString(updatedAt)));
    }

    public void updatedContentEntries(List<ContentEntry> contentEntries) {
        this.updatedAt = LocalDateTime.now();
        record(new ContentBankEntriesUpdatedDomainEvent(
            getId().toString(),
            userId.toString(),
            ContentEntry.toJson(new HashSet<>(contentEntries)),
            Utils.dateToString(updatedAt)));
    }

    public void addContentEntry(ContentEntry contentEntry) {
        var contentEntries = this.getContentEntries();
        contentEntries.add(contentEntry);

        updatedContentEntries(contentEntries);
    }
}
