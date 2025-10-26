package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentBankEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentBankMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBank;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
    public Optional<ContentBank> findByUserIdAndName(UserId userId, String name) {
        return jpaContentBankRepository.findByUserIdAndName(userId.getValue(), name)
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findByIdAndUserId(ContentBankId id, UserId userId) {
        return jpaContentBankRepository.findByIdAndUserId(id.getValue(), userId.getValue())
                .map(contentBankMapper::toDomain);
    }

    @Override
    public void deleteByIdAndUserId(ContentBankId id, UserId userId) {
        jpaContentBankRepository.deleteByIdAndUserId(id.getValue(), userId.getValue());
    }

    @Override
    public Page<ContentBank> findByUserIdAndNameContainingIgnoreCase(UserId userId, String name, Pageable pageable) {
        return jpaContentBankRepository.findByUserIdAndNameContainingIgnoreCase(userId.getValue(), name, pageable)
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findByUserIdAndNameAndIdNot(UserId userId, String name, ContentBankId excludeId) {
        return jpaContentBankRepository.findByUserIdAndNameAndIdNot(userId.getValue(), name, excludeId.getValue())
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findByIdAndUserIdWithContentEntries(ContentBankId id, UserId userId) {
        return jpaContentBankRepository.findByIdAndUserIdWithContentEntries(id.getValue(), userId.getValue())
                .map(contentBankMapper::toDomain);
    }

    @Override
    public Optional<ContentBank> findById(ContentBankId id) {
        return jpaContentBankRepository.findById(id.getValue()).map(contentBankMapper::toDomain);
    }
}