package ai.snippetquiz.core_service.contentbank.domain.port;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentBankProjection;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ContentBankProjectionRepository {

    Optional<ContentBankProjection> findById(ContentBankId id);

    Optional<ContentBankProjection> findByIdAndUserId(ContentBankId id, UserId userId);

    Page<ContentBankProjection> findByUserIdAndNameContainingIgnoreCase(
            UserId userId,
            String name,
            Pageable pageable);
}