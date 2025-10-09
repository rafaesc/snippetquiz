package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryBankEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaContentEntryBankRepository extends JpaRepository<ContentEntryBankEntity, Long> {
    List<ContentEntryBankEntity> findByContentBankId(Long contentBankId);

    List<ContentEntryBankEntity> findByContentEntryId(Long contentEntryId);

    void deleteByContentBankId(Long contentBankId);

    void deleteByContentEntryId(Long contentEntryId);
}