package ai.snippetquiz.core_service.instruction.adapter.out.repository;

import ai.snippetquiz.core_service.instruction.adapter.out.entities.QuizGenerationInstructionEntity;
import ai.snippetquiz.core_service.instruction.adapter.out.mapper.QuizGenerationInstructionMapper;
import ai.snippetquiz.core_service.instruction.domain.QuizGenerationInstruction;
import ai.snippetquiz.core_service.instruction.domain.port.QuizGenerationInstructionRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaQuizGenerationInstructionRepositoryAdapter implements QuizGenerationInstructionRepository {
    private final JpaQuizGenerationInstructionRepository jpaQuizGenerationInstructionRepository;
    private final QuizGenerationInstructionMapper quizGenerationInstructionMapper;

    @Override
    public QuizGenerationInstruction save(
            QuizGenerationInstruction instruction) {
        QuizGenerationInstructionEntity entity = quizGenerationInstructionMapper.toEntity(instruction);
        QuizGenerationInstructionEntity savedEntity = jpaQuizGenerationInstructionRepository.save(entity);
        return quizGenerationInstructionMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<QuizGenerationInstruction> findFirstByUserId(UserId userId) {
        return jpaQuizGenerationInstructionRepository.findFirstByUserId(userId.getValue())
                .map(quizGenerationInstructionMapper::toDomain);
    }
}