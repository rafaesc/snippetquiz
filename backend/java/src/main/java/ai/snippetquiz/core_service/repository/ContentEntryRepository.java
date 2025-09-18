package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.ContentEntry;
import ai.snippetquiz.core_service.entity.ContentType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentEntryRepository extends JpaRepository<ContentEntry, Long> {
    
    // Find all content entries associated with a content bank
    @Query("SELECT ce FROM ContentEntry ce " +
           "JOIN ContentEntryBank ceb ON ce.id = ceb.contentEntry.id " +
           "WHERE ceb.contentBank.id = :contentBankId")
    Page<ContentEntry> findByContentBankId(@Param("contentBankId") Long contentBankId, Pageable pageable);
    
    // Count content entries for a specific content bank
    @Query("SELECT COUNT(ce) FROM ContentEntry ce " +
           "JOIN ContentEntryBank ceb ON ce.id = ceb.contentEntry.id " +
           "WHERE ceb.contentBank.id = :contentBankId")
    long countByContentBankId(@Param("contentBankId") Long contentBankId);
    
    @Query("SELECT ce FROM ContentEntry ce " +
           "JOIN ContentEntryBank ceb ON ce.id = ceb.contentEntry.id " +
           "WHERE ce.sourceUrl = :sourceUrl AND ce.contentType = :contentType AND ceb.contentBank.id = :contentBankId " +
           "ORDER BY ce.createdAt DESC LIMIT 1")
    Optional<ContentEntry> findBySourceUrlAndContentTypeAndContentBankId(
        @Param("sourceUrl") String sourceUrl, 
        @Param("contentType") ContentType contentType, 
        @Param("contentBankId") Long contentBankId);
}