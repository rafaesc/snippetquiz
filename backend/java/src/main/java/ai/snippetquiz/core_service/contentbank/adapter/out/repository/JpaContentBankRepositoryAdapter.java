package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentBankMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaContentBankRepositoryAdapter implements ContentBankRepository {
    private final JpaContentBankRepository jpaContentBankRepository;
    private final ContentBankMapper contentBankMapper;

    @Override
    public ContentBank save(ContentBank contentBank) {
        ContentBankEntity entity = contentBankMapper.toEntity(contentBank);
        ContentBankEntity saved = jpaContentBankRepository.save(entity);
        return contentBankMapper.toDomain(saved);
    }

    @Override
    public Optional<ContentBank> findByUserIdAndName(UUID userId, String name) {
        return jpaContentBankRepository.findByUserIdAndName(userId, name)
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findByIdAndUserId(Long id, UUID userId) {
        return jpaContentBankRepository.findByIdAndUserId(id, userId)
                .map(contentBankMapper::toDomain);
    }

    @Override
    public void deleteByIdAndUserId(Long id, UUID userId) {
        jpaContentBankRepository.deleteByIdAndUserId(id, userId);
    }

    @Override
    public Page<ContentBank> findByUserIdAndNameContainingIgnoreCase(UUID userId, String name, Pageable pageable) {
        return jpaContentBankRepository.findByUserIdAndNameContainingIgnoreCase(userId, name, pageable)
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findByUserIdAndNameAndIdNot(UUID userId, String name, Long excludeId) {
        return jpaContentBankRepository.findByUserIdAndNameAndIdNot(userId, name, excludeId)
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findByIdAndUserIdWithContentEntries(Long id, UUID userId) {
        return jpaContentBankRepository.findByIdAndUserIdWithContentEntries(id, userId)
                .map(contentBankMapper::toDomain);
    }
}