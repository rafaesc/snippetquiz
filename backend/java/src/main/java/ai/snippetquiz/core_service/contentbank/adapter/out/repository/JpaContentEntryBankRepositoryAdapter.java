package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryBankEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentEntryBankMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryBankRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaContentEntryBankRepositoryAdapter implements ContentEntryBankRepository {
    private final JpaContentEntryBankRepository jpaContentEntryBankRepository;
    private final ContentEntryBankMapper contentEntryBankMapper;

    @Override
    public ContentEntryBank save(ContentEntryBank contentEntryBank) {
        ContentEntryBankEntity entity = contentEntryBankMapper.toEntity(contentEntryBank);
        return contentEntryBankMapper.toDomain(jpaContentEntryBankRepository.save(entity));
    }

    @Override
    public List<ContentEntryBank> findByContentBankId(ContentBankId contentBankId) {
        return jpaContentEntryBankRepository.findByContentBankId(contentBankId.getValue())
                .stream()
                .map(contentEntryBankMapper::toDomain)
                .toList();
    }

    @Override
    public List<ContentEntryBank> findByContentEntryId(ContentEntryId contentEntryId) {
        return jpaContentEntryBankRepository.findByContentEntryId(contentEntryId.getValue())
                .stream()
                .map(contentEntryBankMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteByContentEntryId(ContentEntryId contentEntryId) {
        jpaContentEntryBankRepository.deleteByContentEntryId(contentEntryId.getValue());
    }

    @Override
    public List<ContentEntryBank> saveAll(List<ContentEntryBank> contentEntryBanks) {
        return jpaContentEntryBankRepository.saveAll(contentEntryBanks.stream()
                .map(contentEntryBankMapper::toEntity)
                .toList())
                .stream()
                .map(contentEntryBankMapper::toDomain)
                .toList();
    }
}