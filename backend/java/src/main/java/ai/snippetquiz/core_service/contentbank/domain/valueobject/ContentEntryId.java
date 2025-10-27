package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class ContentEntryId extends BaseId<UUID> {
    public ContentEntryId(UUID value) {
        super(value);
    }
    public static ContentEntryId map(String value) {
        return new ContentEntryId(UUID.fromString(value));
    }
}
