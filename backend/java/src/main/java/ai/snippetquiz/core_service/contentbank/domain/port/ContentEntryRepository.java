package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;
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

    void saveAll(List<ContentEntry> contentEntries);

    Optional<ContentEntry> findById(ContentEntryId id);

    void delete(ContentEntry contentEntry);

    List<ContentEntry> findAllByIds(List<ContentEntryId> ids);

    List<ContentEntry> findAllByContentBankId(ContentBankId contentBankId);

    Page<ContentEntry> findByContentBankId(ContentBankId contentBankId, Pageable pageable);

    Optional<ContentEntry> findByIdAndUserId(ContentEntryId id, UserId userId);

    long countByContentBankId(ContentBankId contentBankId);

    Optional<ContentEntry> findBySourceUrlAndContentTypeAndContentBankId(
            String sourceUrl,
            ContentType contentType,
            ContentBankId contentBankId);
}
