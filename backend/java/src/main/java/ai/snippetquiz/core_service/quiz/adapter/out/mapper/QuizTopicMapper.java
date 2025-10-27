package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizTopicEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizTopicMapper {
    @Mapping(target = "quizId.value", source = "entity.quizId")
    QuizTopic toDomain(QuizTopicEntity entity);
    
    @Mapping(target = "quizId", source = "domain.quizId.value")
    QuizTopicEntity toEntity(QuizTopic domain);
}