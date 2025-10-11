package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = { ContentBankMapper.class, ContentEntryTopicMapper.class })
public interface ContentEntryMapper {
    ContentEntry toDomain(ContentEntryEntity entity);

    ContentEntryEntity toEntity(ContentEntry domain);

}