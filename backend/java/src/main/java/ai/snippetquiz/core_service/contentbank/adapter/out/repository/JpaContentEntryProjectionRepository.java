package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryProjectionEntity;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaContentEntryProjectionRepository extends JpaRepository<ContentEntryProjectionEntity, UUID> {

    Page<ContentEntryProjectionEntity> findByContentBanksId(UUID contentBankId, Pageable pageable);

    Optional<ContentEntryProjectionEntity> findByIdAndUserId(UUID id, UUID userId);

    long countByContentBanksId(UUID contentBankId);
}