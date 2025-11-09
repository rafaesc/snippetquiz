package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.YoutubeChannelEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.YoutubeChannel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface YoutubeChannelMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "uncommittedChanges", ignore = true)
    YoutubeChannel toDomain(YoutubeChannelEntity entity);
    
    @Mapping(target = "id", source = "domain.id.value")
    YoutubeChannelEntity toEntity(YoutubeChannel domain);
}