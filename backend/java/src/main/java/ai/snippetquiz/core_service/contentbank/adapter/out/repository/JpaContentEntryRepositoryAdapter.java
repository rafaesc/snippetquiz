package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentEntryMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaContentEntryRepositoryAdapter implements ContentEntryRepository {
    private final JpaContentEntryRepository jpaContentEntryRepository;
    private final ContentEntryMapper contentEntryMapper;

    @Override
    public ContentEntry save(ContentEntry contentEntry) {
        ContentEntryEntity entity = contentEntryMapper.toEntity(contentEntry);
        ContentEntryEntity saved = jpaContentEntryRepository.save(entity);
        return contentEntryMapper.toDomain(saved);
    }

    @Override
    public void delete(ContentEntry contentEntry) {
        jpaContentEntryRepository.delete(contentEntryMapper.toEntity(contentEntry));
    }

    @Override
    public Optional<ContentEntry> findById(ContentEntryId id) {
        return jpaContentEntryRepository.findById(id.getValue()).map(contentEntryMapper::toDomain);
    }

    @Override
    public Page<ContentEntry> findByContentEntryBanks_ContentBank_Id(ContentBankId contentBankId, Pageable pageable) {
        return jpaContentEntryRepository.findByContentEntryBanks_ContentBank_Id(contentBankId.getValue(), pageable).map(contentEntryMapper::toDomain);
    }

    @Override
    public Optional<ContentEntry> findByIdAndUserId(ContentEntryId id, UserId userId) {
        return jpaContentEntryRepository.findByIdAndUserId(id.getValue(), userId.getValue()).map(contentEntryMapper::toDomain);
    }

    @Override
    public long countByContentBankId(ContentBankId contentBankId) {
        return jpaContentEntryRepository.countByContentBankId(contentBankId.getValue());
    }

    @Override
    public Optional<ContentEntry> findBySourceUrlAndContentTypeAndContentBankId(String sourceUrl, ContentType contentType, ContentBankId contentBankId) {
        return jpaContentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(sourceUrl, contentType, contentBankId.getValue()).map(contentEntryMapper::toDomain);
    }
}
