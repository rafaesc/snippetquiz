package ai.snippetquiz.core_service.instruction.adapter.out.mapper;

import ai.snippetquiz.core_service.instruction.adapter.out.entities.QuizGenerationInstructionEntity;
import ai.snippetquiz.core_service.instruction.domain.QuizGenerationInstruction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizGenerationInstructionMapper {
    @Mapping(target = "id.value", source = "entity.id")
    QuizGenerationInstruction toDomain(QuizGenerationInstructionEntity entity);
    
    @Mapping(target = "id", source = "domain.id.value")
    QuizGenerationInstructionEntity toEntity(QuizGenerationInstruction domain);
}