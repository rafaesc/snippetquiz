package ai.snippetquiz.core_service.contentbank.domain.port;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ContentBankRepository {
    Optional<ContentBank> findById(ContentBankId id);

    ContentBank save(ContentBank contentBank);

    Optional<ContentBank> findByUserIdAndName(UserId userId, String name);

    Optional<ContentBank> findByIdAndUserId(ContentBankId id, UserId userId);

    void deleteByIdAndUserId(ContentBankId id, UserId userId);

    Page<ContentBank> findByUserIdAndNameContainingIgnoreCase(
            UserId userId,
            String name,
            Pageable pageable);

    Optional<ContentBank> findByUserIdAndNameAndIdNot(UserId userId, String name, ContentBankId excludeId);

    Optional<ContentBank> findByIdAndUserIdWithContentEntries(ContentBankId id, UserId userId);
}
