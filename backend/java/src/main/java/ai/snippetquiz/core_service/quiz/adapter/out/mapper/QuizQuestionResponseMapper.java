package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionResponseEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizQuestionResponseMapper {
    QuizQuestionResponse toDomain(QuizQuestionResponseEntity entity);
    
    QuizQuestionResponseEntity toEntity(QuizQuestionResponse domain);
}