package ai.snippetquiz.core_service.question.adapter.out.mapper;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionOptionEntity;
import ai.snippetquiz.core_service.question.domain.QuestionOption;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuestionOptionMapper {
    @Mapping(target = "question", ignore = true)
    QuestionOption toDomain(QuestionOptionEntity entity);
    
    QuestionOptionEntity toEntity(QuestionOption domain);
}