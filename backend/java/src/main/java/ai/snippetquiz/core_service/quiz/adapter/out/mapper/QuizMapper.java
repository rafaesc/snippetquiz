package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizEntity;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {QuizTopicMapper.class})
public interface QuizMapper {
    @Mapping(target = "contentBankId.value", source = "entity.contentBankId")
    Quiz toDomain(QuizEntity entity);

    @Mapping(target = "contentBankId", source = "domain.contentBankId.value")
    QuizEntity toEntity(Quiz domain);
}