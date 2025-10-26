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
public interface JpaContentBankRepository extends JpaRepository<ContentBankEntity, UUID> {
    
    Optional<ContentBankEntity> findByUserIdAndName(UUID userId, String name);
    
    Optional<ContentBankEntity> findByIdAndUserId(UUID id, UUID userId);
    
    void deleteByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT cb FROM ContentBankEntity cb WHERE cb.userId = :userId " +
            "AND (LOWER(cb.name) LIKE LOWER(CONCAT('%', :name, '%')) OR :name IS NULL)")
    Page<ContentBankEntity> findByUserIdAndNameContainingIgnoreCase(
            @Param("userId") UUID userId,
            @Param("name") String name,
            Pageable pageable);
    
    Optional<ContentBankEntity> findByUserIdAndNameAndIdNot(UUID userId, String name, UUID excludeId);

    @Query("SELECT DISTINCT cb FROM ContentBankEntity cb " +
            "INNER JOIN FETCH cb.contentEntryBanks ceb " +
            "INNER JOIN FETCH ceb.contentEntry ce " +
            "WHERE cb.id = :id AND cb.userId = :userId")
    Optional<ContentBankEntity> findByIdAndUserIdWithContentEntries(@Param("id") UUID id, @Param("userId") UUID userId);
}