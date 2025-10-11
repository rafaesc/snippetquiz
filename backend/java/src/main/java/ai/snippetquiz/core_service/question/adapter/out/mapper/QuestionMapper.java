package ai.snippetquiz.core_service.question.adapter.out.mapper;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionEntity;
import ai.snippetquiz.core_service.question.domain.Question;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = { QuestionOptionMapper.class })
public interface QuestionMapper {
    Question toDomain(QuestionEntity entity);
    
    QuestionEntity toEntity(Question domain);
}