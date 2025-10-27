package ai.snippetquiz.core_service.contentbank.domain.port;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryProjection;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ContentEntryProjectionRepository {

    Optional<ContentEntryProjection> findById(ContentEntryId id);

    Optional<ContentEntryProjection> findByIdAndUserId(ContentEntryId id, UserId userId);

    Page<ContentEntryProjection> findByContentBankId(ContentBankId contentBankId, Pageable pageable);

    long countByContentBankId(ContentBankId contentBankId);
}