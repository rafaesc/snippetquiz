package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.ContentEntryBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentEntryBankRepository extends JpaRepository<ContentEntryBank, Long> {
    
    List<ContentEntryBank> findByContentBankId(Long contentBankId);
    
    List<ContentEntryBank> findByContentEntryId(Long contentEntryId);
    
    void deleteByContentBankId(Long contentBankId);
    
    void deleteByContentEntryId(Long contentEntryId);
}