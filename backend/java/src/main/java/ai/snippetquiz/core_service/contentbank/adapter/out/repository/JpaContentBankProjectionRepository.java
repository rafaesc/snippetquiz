package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankProjectionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaContentBankProjectionRepository extends JpaRepository<ContentBankProjectionEntity, UUID> {

    Optional<ContentBankProjectionEntity> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT cb FROM ContentBankProjectionEntity cb WHERE cb.userId = :userId " +
            "AND (LOWER(cb.name) LIKE LOWER(CONCAT('%', :name, '%')) OR :name IS NULL)")
    Page<ContentBankProjectionEntity> findByUserIdAndNameContainingIgnoreCase(
            @Param("userId") UUID userId,
            @Param("name") String name,
            Pageable pageable);
}