package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = { ContentBankMapper.class, ContentEntryTopicMapper.class })
public interface ContentEntryMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "userId.value", source = "entity.userId")
    @Mapping(target = "contentBankId.value", source = "entity.contentBankId")
    ContentEntry toDomain(ContentEntryEntity entity);

    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "userId", source = "domain.userId.value")
    @Mapping(target = "contentBankId", source = "domain.contentBankId.value")
    ContentEntryEntity toEntity(ContentEntry domain);

}