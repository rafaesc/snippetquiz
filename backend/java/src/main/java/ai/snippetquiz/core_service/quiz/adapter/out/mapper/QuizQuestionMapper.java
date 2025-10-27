package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizQuestionMapper {
    @Mapping(target = "contentEntryId.value", source = "entity.contentEntryId")
    @Mapping(target = "quizId.value", source = "entity.quizId")
    QuizQuestion toDomain(QuizQuestionEntity entity);
    
    @Mapping(target = "contentEntryId", source = "domain.contentEntryId.value")
    @Mapping(target = "quizId", source = "domain.quizId.value")
    QuizQuestionEntity toEntity(QuizQuestion domain);
}