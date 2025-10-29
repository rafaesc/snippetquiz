package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class ContentBankId extends BaseId<UUID> {
    public ContentBankId(UUID value) {
        super(value);
    }

    public static ContentBankId create() {
        return new ContentBankId(UUID.randomUUID());
    }
    
    @Override
    public String toString() {
        return getValue().toString();
    }
}
