package ai.snippetquiz.core_service.instruction.domain.port;

import ai.snippetquiz.core_service.instruction.domain.QuizGenerationInstruction;

import java.util.Optional;
import java.util.UUID;

public interface QuizGenerationInstructionRepository {
    QuizGenerationInstruction save(QuizGenerationInstruction contentEntry);

    Optional<QuizGenerationInstruction> findFirstByUserId(UUID userId);
}
