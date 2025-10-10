package ai.snippetquiz.core_service.instruction.adapter.out.mapper;

import ai.snippetquiz.core_service.instruction.adapter.out.entities.QuizGenerationInstructionEntity;
import ai.snippetquiz.core_service.instruction.domain.QuizGenerationInstruction;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizGenerationInstructionMapper {
    QuizGenerationInstruction toDomain(QuizGenerationInstructionEntity entity);
    
    QuizGenerationInstructionEntity toEntity(QuizGenerationInstruction domain);
}