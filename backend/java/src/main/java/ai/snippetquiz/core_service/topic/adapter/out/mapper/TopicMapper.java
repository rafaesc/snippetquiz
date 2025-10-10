package ai.snippetquiz.core_service.topic.adapter.out.mapper;

import ai.snippetquiz.core_service.topic.adapter.out.entities.TopicEntity;
import ai.snippetquiz.core_service.topic.domain.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TopicMapper {
    Topic toDomain(TopicEntity entity);
    
    TopicEntity toEntity(Topic domain);
}