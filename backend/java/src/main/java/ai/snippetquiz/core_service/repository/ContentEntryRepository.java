package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.ContentEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentEntryRepository extends JpaRepository<ContentEntry, Long> {
    
    // Find all content entries associated with a content bank
    @Query("SELECT ce FROM ContentEntry ce " +
           "JOIN ContentEntryBank ceb ON ce.id = ceb.contentEntry.id " +
           "WHERE ceb.contentBank.id = :contentBankId")
    List<ContentEntry> findByContentBankId(@Param("contentBankId") Long contentBankId);
    
    // Count content entries for a specific content bank
    @Query("SELECT COUNT(ce) FROM ContentEntry ce " +
           "JOIN ContentEntryBank ceb ON ce.id = ceb.contentEntry.id " +
           "WHERE ceb.contentBank.id = :contentBankId")
    long countByContentBankId(@Param("contentBankId") Long contentBankId);
}