package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryBankEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ContentEntryBankMapper {
    ContentEntryBank toDomain(ContentEntryBankEntity entity);
    
    ContentEntryBankEntity toEntity(ContentEntryBank domain);
}