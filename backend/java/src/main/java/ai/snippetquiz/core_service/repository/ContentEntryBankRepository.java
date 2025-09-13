package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.ContentEntryBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentEntryBankRepository extends JpaRepository<ContentEntryBank, Long> {
    
    // Find all associations for a content bank
    List<ContentEntryBank> findByContentBankId(Long contentBankId);
    
    // Find all associations for a content entry
    List<ContentEntryBank> findByContentEntryId(Long contentEntryId);
    
    // Delete all associations for a content bank
    void deleteByContentBankId(Long contentBankId);
    
    // Delete all associations for a content entry
    void deleteByContentEntryId(Long contentEntryId);
}