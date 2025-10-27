package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionResponseEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {QuizQuestionMapper.class, QuizQuestionOptionMapper.class})
public interface QuizQuestionResponseMapper {
    @Mapping(target = "userId.value", source = "entity.userId")
    @Mapping(target = "quizId.value", source = "entity.quizId")
    QuizQuestionResponse toDomain(QuizQuestionResponseEntity entity);
    
    @Mapping(target = "userId", source = "domain.userId.value")
    @Mapping(target = "quizId", source = "domain.quizId.value")
    QuizQuestionResponseEntity toEntity(QuizQuestionResponse domain);
}