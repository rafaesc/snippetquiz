package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;

public interface ContentEntryBankRepository {
    ContentEntryBank save(ContentEntryBank contentEntryBank);

    List<ContentEntryBank> findByContentBankId(Long contentBankId);

    List<ContentEntryBank> findByContentEntryId(Long contentEntryId);

    void deleteByContentBankId(Long contentBankId);

    void deleteByContentEntryId(Long contentEntryId);
}
