package ai.snippetquiz.core_service.question.adapter.out.mapper;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionEntity;
import ai.snippetquiz.core_service.question.domain.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface QuestionMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "contentEntryId.value", source = "entity.contentEntryId")
    @Mapping(target = "chunkIndex.value", source = "entity.chunkIndex")
    @Mapping(target = "questionIndexInChunk.value", source = "entity.questionIndexInChunk")
    Question toDomain(QuestionEntity entity);
}