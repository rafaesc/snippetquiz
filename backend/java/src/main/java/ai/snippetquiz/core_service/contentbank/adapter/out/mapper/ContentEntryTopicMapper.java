package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryTopicEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContentEntryTopicMapper {
    @Mapping(target = "contentEntryId.value", source = "entity.contentEntryId")
    ContentEntryTopic toDomain(ContentEntryTopicEntity entity);
    
    @Mapping(target = "contentEntryId", source = "domain.contentEntryId.value")
    ContentEntryTopicEntity toEntity(ContentEntryTopic domain);
}