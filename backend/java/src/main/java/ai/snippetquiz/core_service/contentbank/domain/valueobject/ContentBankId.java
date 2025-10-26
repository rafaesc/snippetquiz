package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class ContentBankId extends BaseId<UUID> {
    public ContentBankId(UUID value) {
        super(value);
    }
}
