package ai.snippetquiz.core_service.question.adapter.out.mapper;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionEntity;
import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionOptionEntity;
import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.question.domain.QuestionOption;

import java.util.List;

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
    
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "question", ignore = true)
    QuestionOption toDomain(QuestionOptionEntity entity);

    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "question", source = "domain.question")
    QuestionOptionEntity toEntity(QuestionOption domain);

    List<QuestionOptionEntity> toEntity(List<QuestionOption> domain);

    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "contentEntryId", source = "domain.contentEntryId.value")
    @Mapping(target = "chunkIndex", source = "domain.chunkIndex.value")
    @Mapping(target = "questionIndexInChunk", source = "domain.questionIndexInChunk.value")
    @Mapping(target = "questionOptions", ignore = true)
    QuestionEntity toEntity(Question domain);
}