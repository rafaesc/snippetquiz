package ai.snippetquiz.core_service.contentbank.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.adapter.out.entities.ContentEntryTopicEntity;
import ai.snippetquiz.core_service.contentbank.adapter.out.mapper.ContentEntryTopicMapper;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaContentEntryTopicRepositoryAdapter implements ContentEntryTopicRepository {
    private final JpaContentEntryTopicRepository jpaContentEntryTopicRepository;
    private final ContentEntryTopicMapper contentEntryTopicMapper;

    @Override
    public ContentEntryTopic save(ContentEntryTopic contentEntryTopic) {
        ContentEntryTopicEntity entity = contentEntryTopicMapper.toEntity(contentEntryTopic);
        return contentEntryTopicMapper.toDomain(jpaContentEntryTopicRepository.save(entity));
    }

    @Override
    public List<ContentEntryTopic> findByContentEntryId(Long contentEntryId) {
        return jpaContentEntryTopicRepository.findByContentEntryId(contentEntryId)
                .stream()
                .map(contentEntryTopicMapper::toDomain)
                .toList();
    }

    @Override
    public List<ContentEntryTopic> findByTopicId(Long topicId) {
        return jpaContentEntryTopicRepository.findByTopicId(topicId)
                .stream()
                .map(contentEntryTopicMapper::toDomain)
                .toList();
    }

    @Override
    public List<ContentEntryTopic> findByContentEntryIdIn(List<Long> contentEntryIds) {
        return jpaContentEntryTopicRepository.findByContentEntryIdIn(contentEntryIds)
                .stream()
                .map(contentEntryTopicMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteByContentEntryId(Long contentEntryId) {
        jpaContentEntryTopicRepository.deleteByContentEntryId(contentEntryId);
    }
}