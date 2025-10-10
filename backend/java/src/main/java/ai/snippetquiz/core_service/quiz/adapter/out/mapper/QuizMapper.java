package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizEntity;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizMapper {
    Quiz toDomain(QuizEntity entity);
    
    QuizEntity toEntity(Quiz domain);
}