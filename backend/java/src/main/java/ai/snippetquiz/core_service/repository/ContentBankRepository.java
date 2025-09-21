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

    Optional<ContentBank> findByUserIdAndName(UUID userId, String name);

    Optional<ContentBank> findByIdAndUserId(Long id, UUID userId);

    void deleteByIdAndUserId(Long id, UUID userId);

    @Query("SELECT cb FROM ContentBank cb WHERE cb.userId = :userId " +
            "AND (LOWER(cb.name) LIKE LOWER(CONCAT('%', :name, '%')) OR :name IS NULL)")
    Page<ContentBank> findByUserIdAndNameContainingIgnoreCase(
            @Param("userId") UUID userId,
            @Param("name") String name,
            Pageable pageable);

    Optional<ContentBank> findByUserIdAndNameAndIdNot(UUID userId, String name, Long excludeId);

    @Query("SELECT DISTINCT cb FROM ContentBank cb " +
            "INNER JOIN FETCH cb.contentEntryBanks ceb " +
            "INNER JOIN FETCH ceb.contentEntry ce " +
            "WHERE cb.id = :id AND cb.userId = :userId")
    Optional<ContentBank> findByIdAndUserIdWithContentEntries(@Param("id") Long id, @Param("userId") UUID userId);
}