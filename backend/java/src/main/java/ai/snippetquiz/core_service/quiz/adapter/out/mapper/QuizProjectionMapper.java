package ai.snippetquiz.core_service.quiz.adapter.out.mapper;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizProjectionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuizProjectionMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "contentBankId.value", source = "entity.contentBankId")
    @Mapping(target = "userId.value", source = "entity.userId")
    QuizProjection toDomain(QuizProjectionEntity entity);

    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "contentBankId", source = "domain.contentBankId.value")
    @Mapping(target = "userId", source = "domain.userId.value")
    QuizProjectionEntity toEntity(QuizProjection domain);
}