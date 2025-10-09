package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaContentBankRepository extends JpaRepository<ContentBankEntity, Long> {
    
    Optional<ContentBankEntity> findByUserIdAndName(UUID userId, String name);
    
    Optional<ContentBankEntity> findByIdAndUserId(Long id, UUID userId);
    
    void deleteByIdAndUserId(Long id, UUID userId);
    
    Page<ContentBankEntity> findByUserIdAndNameContainingIgnoreCase(
            UUID userId,
            String name,
            Pageable pageable);
    
    Optional<ContentBankEntity> findByUserIdAndNameAndIdNot(UUID userId, String name, Long excludeId);
    
    @Query("SELECT cb FROM ContentBankEntity cb LEFT JOIN FETCH cb.contentEntries WHERE cb.id = :id AND cb.userId = :userId")
    Optional<ContentBankEntity> findByIdAndUserIdWithContentEntries(@Param("id") Long id, @Param("userId") UUID userId);
}