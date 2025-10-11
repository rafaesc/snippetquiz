package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionOptionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {QuizTopicMapper.class})
public interface QuizQuestionOptionMapper {
    @Mapping(target = "quizQuestion", ignore = true)
    @Mapping(target = "quizQuestionResponses", ignore = true)
    QuizQuestionOption toDomain(QuizQuestionOptionEntity entity);
    
    QuizQuestionOptionEntity toEntity(QuizQuestionOption domain);
}