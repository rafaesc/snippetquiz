package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentEntryMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

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
    public Optional<ContentEntry> findById(Long id) {
        return jpaContentEntryRepository.findById(id).map(contentEntryMapper::toDomain);
    }

    @Override
    public Page<ContentEntry> findByContentEntryBanks_ContentBank_Id(Long contentBankId, Pageable pageable) {
        return jpaContentEntryRepository.findByContentEntryBanks_ContentBank_Id(contentBankId, pageable).map(contentEntryMapper::toDomain);
    }

    @Override
    public Optional<ContentEntry> findByIdAndUserId(Long id, UUID userId) {
        return jpaContentEntryRepository.findByIdAndUserId(id, userId).map(contentEntryMapper::toDomain);
    }

    @Override
    public long countByContentBankId(Long contentBankId) {
        return jpaContentEntryRepository.countByContentBankId(contentBankId);
    }

    @Override
    public Optional<ContentEntry> findBySourceUrlAndContentTypeAndContentBankId(String sourceUrl, ContentType contentType, Long contentBankId) {
        return jpaContentEntryRepository.findBySourceUrlAndContentTypeAndContentBankId(sourceUrl, contentType, contentBankId).map(contentEntryMapper::toDomain);
    }
}
