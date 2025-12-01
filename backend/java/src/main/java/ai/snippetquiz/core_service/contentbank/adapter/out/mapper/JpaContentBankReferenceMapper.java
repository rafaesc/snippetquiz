package ai.snippetquiz.core_service.contentbank.adapter.out.mapper;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankEntity;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public class JpaContentBankReferenceMapper {

    @PersistenceContext
    private EntityManager em;

    public ContentBankEntity resolve(ContentBankId id) {
        if (id == null) {
            return null;
        }
        return em.getReference(ContentBankEntity.class, id.getValue());
    }
}
