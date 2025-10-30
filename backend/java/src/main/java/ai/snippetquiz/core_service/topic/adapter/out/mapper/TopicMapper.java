package ai.snippetquiz.core_service.topic.adapter.out.mapper;

import ai.snippetquiz.core_service.topic.adapter.out.entities.TopicEntity;
import ai.snippetquiz.core_service.topic.domain.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TopicMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "userId.value", source = "entity.userId")
    Topic toDomain(TopicEntity entity);
    
    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "userId", source = "domain.userId.value")
    TopicEntity toEntity(Topic domain);
}