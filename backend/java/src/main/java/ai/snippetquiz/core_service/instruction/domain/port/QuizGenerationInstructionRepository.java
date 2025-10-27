package ai.snippetquiz.core_service.instruction.domain.port;

import ai.snippetquiz.core_service.instruction.domain.QuizGenerationInstruction;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import java.util.Optional;

public interface QuizGenerationInstructionRepository {
    QuizGenerationInstruction save(QuizGenerationInstruction contentEntry);

    Optional<QuizGenerationInstruction> findFirstByUserId(UserId userId);
}
