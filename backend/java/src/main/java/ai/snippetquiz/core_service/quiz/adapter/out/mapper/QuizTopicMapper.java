package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizTopicEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizTopicMapper {
    QuizTopic toDomain(QuizTopicEntity entity);
    
    QuizTopicEntity toEntity(QuizTopic domain);
}