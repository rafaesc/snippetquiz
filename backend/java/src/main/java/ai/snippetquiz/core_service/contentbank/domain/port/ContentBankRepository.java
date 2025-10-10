package ai.snippetquiz.core_service.contentbank.domain.port;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ContentBankRepository {
    ContentBank save(ContentBank contentBank);

    Optional<ContentBank> findByUserIdAndName(UUID userId, String name);

    Optional<ContentBank> findByIdAndUserId(Long id, UUID userId);

    void deleteByIdAndUserId(Long id, UUID userId);

    Page<ContentBank> findByUserIdAndNameContainingIgnoreCase(
            UUID userId,
            String name,
            Pageable pageable);

    Optional<ContentBank> findByUserIdAndNameAndIdNot(UUID userId, String name, Long excludeId);

    Optional<ContentBank> findByIdAndUserIdWithContentEntries(Long id, UUID userId);
}
