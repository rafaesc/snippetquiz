package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryTopicEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContentEntryTopicMapper {
    ContentEntryTopic toDomain(ContentEntryTopicEntity entity);
    
    ContentEntryTopicEntity toEntity(ContentEntryTopic domain);
}