package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryEntity;
import ai.snippetquiz.core_service.shared.domain.ContentType;

import java.util.List;
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

    Page<ContentEntryEntity> findByContentBankId(UUID contentBankId, Pageable pageable);

    List<ContentEntryEntity> findAllByContentBankId(UUID contentBankId);

    Optional<ContentEntryEntity> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT COUNT(ce) FROM ContentEntryEntity ce " +
            "WHERE ce.contentBankId = :contentBankId")
    long countByContentBankId(@Param("contentBankId") UUID contentBankId);

    @Query("SELECT ce FROM ContentEntryEntity ce " +
            "WHERE ce.sourceUrl = :sourceUrl AND ce.contentType = :contentType AND ce.contentBankId = :contentBankId " +
            "ORDER BY ce.createdAt DESC LIMIT 1")
    Optional<ContentEntryEntity> findBySourceUrlAndContentTypeAndContentBankId(
            @Param("sourceUrl") String sourceUrl,
            @Param("contentType") ContentType contentType,
            @Param("contentBankId") UUID contentBankId);
}
