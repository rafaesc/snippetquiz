package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizQuestionMapper {
    QuizQuestion toDomain(QuizQuestionEntity entity);
    
    QuizQuestionEntity toEntity(QuizQuestion domain);
}