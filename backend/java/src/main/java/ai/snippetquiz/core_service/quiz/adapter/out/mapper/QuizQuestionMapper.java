package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {QuizQuestionOptionMapper.class, QuizTopicMapper.class})
public interface QuizQuestionMapper {
    @Mapping(target = "quiz", ignore = true)
    @Mapping(target = "quizQuestionResponses", ignore = true)
    QuizQuestion toDomain(QuizQuestionEntity entity);
    
    QuizQuestionEntity toEntity(QuizQuestion domain);
}