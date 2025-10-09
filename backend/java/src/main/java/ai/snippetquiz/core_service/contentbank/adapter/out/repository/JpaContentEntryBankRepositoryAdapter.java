package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryBankEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentEntryBankMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryBank;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentEntryBankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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
    public List<ContentEntryBank> findByContentBankId(Long contentBankId) {
        return jpaContentEntryBankRepository.findByContentBankId(contentBankId)
                .stream()
                .map(contentEntryBankMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContentEntryBank> findByContentEntryId(Long contentEntryId) {
        return jpaContentEntryBankRepository.findByContentEntryId(contentEntryId)
                .stream()
                .map(contentEntryBankMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByContentBankId(Long contentBankId) {
        jpaContentEntryBankRepository.deleteByContentBankId(contentBankId);
    }

    @Override
    public void deleteByContentEntryId(Long contentEntryId) {
        jpaContentEntryBankRepository.deleteByContentEntryId(contentEntryId);
    }
}