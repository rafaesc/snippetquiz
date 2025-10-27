package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentBankProjectionMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentBankProjection;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentBankProjectionRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaContentBankProjectionRepositoryAdapter implements ContentBankProjectionRepository {
    private final JpaContentBankProjectionRepository jpaContentBankProjectionRepository;
    private final ContentBankProjectionMapper contentBankProjectionMapper;

    @Override
    public Optional<ContentBankProjection> findById(ContentBankId id) {
        return jpaContentBankProjectionRepository.findById(id.getValue()).map(contentBankProjectionMapper::toDomain);
    }

    @Override
    public Optional<ContentBankProjection> findByIdAndUserId(ContentBankId id, UserId userId) {
        return jpaContentBankProjectionRepository.findByIdAndUserId(id.getValue(), userId.getValue())
                .map(contentBankProjectionMapper::toDomain);
    }

    @Override
    public Page<ContentBankProjection> findByUserIdAndNameContainingIgnoreCase(UserId userId, String name, Pageable pageable) {
        return jpaContentBankProjectionRepository.findByUserIdAndNameContainingIgnoreCase(userId.getValue(), name, pageable)
                .map(contentBankProjectionMapper::toDomain);
    }
}