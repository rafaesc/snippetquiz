package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryProjectionEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContentEntryProjectionMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "userId.value", source = "entity.userId")
    @Mapping(target = "contentBankId.value", source = "entity.contentBanksId")
    ContentEntryProjection toDomain(ContentEntryProjectionEntity entity);

    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "userId", source = "domain.userId.value")
    @Mapping(target = "contentBanksId", source = "domain.contentBankId.value")
    ContentEntryProjectionEntity toEntity(ContentEntryProjection domain);
}