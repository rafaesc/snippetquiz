package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentEntryProjectionMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryProjection;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryProjectionRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JpaContentEntryProjectionRepositoryAdapter implements ContentEntryProjectionRepository {
    private final JpaContentEntryProjectionRepository jpaContentEntryProjectionRepository;
    private final ContentEntryProjectionMapper contentEntryProjectionMapper;

    @Override
    public Optional<ContentEntryProjection> findById(ContentEntryId id) {
        return jpaContentEntryProjectionRepository.findById(id.getValue()).map(contentEntryProjectionMapper::toDomain);
    }

    @Override
    public Optional<ContentEntryProjection> findByIdAndUserId(ContentEntryId id, UserId userId) {
        return jpaContentEntryProjectionRepository.findByIdAndUserId(id.getValue(), userId.getValue())
                .map(contentEntryProjectionMapper::toDomain);
    }

    @Override
    public Page<ContentEntryProjection> findByContentBankId(ContentBankId contentBankId, Pageable pageable) {
        return jpaContentEntryProjectionRepository.findByContentBanksId(contentBankId.getValue(), pageable)
                .map(contentEntryProjectionMapper::toDomain);
    }

    @Override
    public long countByContentBankId(ContentBankId contentBankId) {
        return jpaContentEntryProjectionRepository.countByContentBanksId(contentBankId.getValue());
    }
}