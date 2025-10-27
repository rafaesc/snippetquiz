package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankProjectionEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBankProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContentBankProjectionMapper {
    @Mapping(target = "id.value", source = "entity.id")
    @Mapping(target = "userId.value", source = "entity.userId")
    ContentBankProjection toDomain(ContentBankProjectionEntity entity);

    @Mapping(target = "id", source = "domain.id.value")
    @Mapping(target = "userId", source = "domain.userId.value")
    ContentBankProjectionEntity toEntity(ContentBankProjection domain);
}