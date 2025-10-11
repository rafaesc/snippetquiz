package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankEntity;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {ContentEntryMapper.class})
public interface ContentBankMapper {
    ContentBank toDomain(ContentBankEntity entity);
    
    ContentBankEntity toEntity(ContentBank domain);
}
