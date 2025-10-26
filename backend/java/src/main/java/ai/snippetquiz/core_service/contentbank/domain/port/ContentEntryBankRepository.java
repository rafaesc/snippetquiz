package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;
import java.util.UUID;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;

public interface ContentEntryBankRepository {
    ContentEntryBank save(ContentEntryBank contentEntryBank);

    List<ContentEntryBank> findByContentBankId(UUID contentBankId);

    List<ContentEntryBank> findByContentEntryId(Long contentEntryId);

    void deleteByContentEntryId(Long contentEntryId);
}
