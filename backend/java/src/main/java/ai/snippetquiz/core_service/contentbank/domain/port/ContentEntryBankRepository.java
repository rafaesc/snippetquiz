package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;

public interface ContentEntryBankRepository {
    ContentEntryBank save(ContentEntryBank contentEntryBank);

    List<ContentEntryBank> findByContentBankId(ContentBankId contentBankId);

    List<ContentEntryBank> findByContentEntryId(ContentEntryId contentEntryId);

    void deleteByContentEntryId(ContentEntryId contentEntryId);
}
