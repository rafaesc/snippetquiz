package ai.snippetquiz.core_service.instruction.adapter.out.repository;

import ai.snippetquiz.core_service.instruction.adapter.out.entities.QuizGenerationInstructionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaQuizGenerationInstructionRepository extends JpaRepository<QuizGenerationInstructionEntity, UUID> {
    
    Optional<QuizGenerationInstructionEntity> findFirstByUserId(UUID userId);
}