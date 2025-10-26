package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ContentBank extends AggregateRoot<ContentBankId> {
    private ContentBankId id;
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
        return contentBank;
    }
}
