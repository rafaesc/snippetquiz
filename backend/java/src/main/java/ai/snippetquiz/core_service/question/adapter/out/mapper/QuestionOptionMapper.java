package ai.snippetquiz.core_service.question.adapter.out.mapper;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionEntity;
import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionOptionEntity;
import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.question.domain.QuestionOption;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuestionOptionMapper {
    @Mapping(target = "question", ignore = true)
    QuestionOption toDomain(QuestionOptionEntity entity);

    List<QuestionOptionEntity> toEntity(List<QuestionOption> domain);
    
    @Mapping(target = "contentEntryId", source = "domain.contentEntryId.value")
    @Mapping(target = "questionOptions", ignore = true)
    QuestionEntity toEntity(Question domain);
}