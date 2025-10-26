package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

public interface ContentEntryRepository {
    ContentEntry save(ContentEntry contentEntry);

    Optional<ContentEntry> findById(ContentEntryId id);

    void delete(ContentEntry contentEntry);

    Page<ContentEntry> findByContentEntryBanks_ContentBank_Id(ContentBankId contentBankId, Pageable pageable);

    Optional<ContentEntry> findByIdAndUserId(ContentEntryId id, UserId userId);

    long countByContentBankId(ContentBankId contentBankId);

    Optional<ContentEntry> findBySourceUrlAndContentTypeAndContentBankId(
            String sourceUrl,
            ContentType contentType,
            ContentBankId contentBankId);
}
