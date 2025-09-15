package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.ContentBank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentBankRepository extends JpaRepository<ContentBank, Long> {

    // Find by user ID and name for duplicate checking
    Optional<ContentBank> findByUserIdAndName(UUID userId, String name);

    // Find by ID and user ID for ownership verification
    Optional<ContentBank> findByIdAndUserId(Long id, UUID userId);

    // Find all by user ID with optional name filtering
    @Query("SELECT cb FROM ContentBank cb WHERE cb.userId = :userId " +
            "AND (LOWER(cb.name) LIKE LOWER(CONCAT('%', :name, '%')) OR :name IS NULL)")
    Page<ContentBank> findByUserIdAndNameContainingIgnoreCase(
            @Param("userId") UUID userId,
            @Param("name") String name,
            Pageable pageable);

    // Count by user ID and optional name filter
    @Query("SELECT COUNT(cb) FROM ContentBank cb WHERE cb.userId = :userId " +
            "AND (LOWER(cb.name) LIKE LOWER(CONCAT('%', :name, '%')) OR :name IS NULL)")
    long countByUserIdAndNameContainingIgnoreCase(
            @Param("userId") UUID userId,
            @Param("name") String name);

    // Find by user ID and name excluding specific ID (for update validation)
    @Query("SELECT cb FROM ContentBank cb WHERE cb.userId = :userId " +
            "AND cb.name = :name AND cb.id != :excludeId")
    Optional<ContentBank> findByUserIdAndNameExcludingId(
            @Param("userId") UUID userId,
            @Param("name") String name,
            @Param("excludeId") Long excludeId);

    @Query("SELECT DISTINCT cb FROM ContentBank cb " +
           "LEFT JOIN FETCH cb.contentEntryBanks ceb " +
           "LEFT JOIN FETCH ceb.contentEntry ce " +
           "WHERE cb.id = :id AND cb.userId = :userId AND ce.questionsGenerated = true")
    Optional<ContentBank> findByIdAndUserIdWithContentEntries(@Param("id") Long id, @Param("userId") UUID userId);
}