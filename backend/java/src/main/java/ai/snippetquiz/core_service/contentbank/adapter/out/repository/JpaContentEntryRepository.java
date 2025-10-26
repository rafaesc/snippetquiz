package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryEntity;
import ai.snippetquiz.core_service.shared.domain.ContentType;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaContentEntryRepository extends JpaRepository<ContentEntryEntity, UUID> {

    Page<ContentEntryEntity> findByContentEntryBanks_ContentBank_Id(UUID contentBankId, Pageable pageable);

    Optional<ContentEntryEntity> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(ce) FROM ContentEntryEntity ce " +
            "JOIN ContentEntryBankEntity ceb ON ce.id = ceb.contentEntry.id " +
            "WHERE ceb.contentBank.id = :contentBankId")
    long countByContentBankId(@Param("contentBankId") UUID contentBankId);

    @Query("SELECT ce FROM ContentEntryEntity ce " +
            "JOIN ContentEntryBankEntity ceb ON ce.id = ceb.contentEntry.id " +
            "WHERE ce.sourceUrl = :sourceUrl AND ce.contentType = :contentType AND ceb.contentBank.id = :contentBankId " +
            "ORDER BY ce.createdAt DESC LIMIT 1")
    Optional<ContentEntryEntity> findBySourceUrlAndContentTypeAndContentBankId(
            @Param("sourceUrl") String sourceUrl,
            @Param("contentType") ContentType contentType,
            @Param("contentBankId") UUID contentBankId);
}
