package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.shared.domain.ContentType;

public interface ContentEntryRepository {
    ContentEntry save(ContentEntry contentEntry);

    Optional<ContentEntry> findById(Long id);

    void delete(ContentEntry contentEntry);

    Page<ContentEntry> findByContentEntryBanks_ContentBank_Id(Long contentBankId, Pageable pageable);

    Optional<ContentEntry> findByIdAndUserId(Long id, UUID userId);

    long countByContentBankId(Long contentBankId);

    Optional<ContentEntry> findBySourceUrlAndContentTypeAndContentBankId(
            String sourceUrl,
            ContentType contentType,
            Long contentBankId);
}
