package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.QuizGenerationInstruction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizGenerationInstructionRepository extends JpaRepository<QuizGenerationInstruction, Long> {
    
    Optional<QuizGenerationInstruction> findFirstByUserId(UUID userId);
}