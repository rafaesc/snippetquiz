package ai.snippetquiz.core_service.topic.adapter.out.repository;

import ai.snippetquiz.core_service.topic.adapter.out.entities.TopicEntity;
import ai.snippetquiz.core_service.topic.adapter.out.mapper.TopicMapper;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JpaTopicRepositoryAdapter implements TopicRepository {
    private final JpaTopicRepository jpaTopicRepository;
    private final TopicMapper topicMapper;

    @Override
    public Topic save(Topic topic) {
        TopicEntity entity = topicMapper.toEntity(topic);
        TopicEntity savedEntity = jpaTopicRepository.save(entity);
        return topicMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Topic> findByUserIdAndTopic(UUID userId, String topic) {
        return jpaTopicRepository.findByUserIdAndTopic(userId, topic)
                .map(topicMapper::toDomain);
    }

    @Override
    public List<Topic> findAllByUserId(UUID userId) {
        return jpaTopicRepository.findAllByUserId(userId).stream()
                .map(topicMapper::toDomain)
                .toList();
    }

    @Override
    public List<Topic> findByUserIdAndTopicIn(UUID userId, List<String> topics) {
        return jpaTopicRepository.findByUserIdAndTopicIn(userId, topics).stream()
                .map(topicMapper::toDomain)
                .toList();
    }

    @Override
    public List<Topic> findAllByIdInAndUserId(List<Long> ids, UUID userId) {
        return jpaTopicRepository.findAllByIdInAndUserId(ids, userId).stream()
                .map(topicMapper::toDomain)
                .toList();
    }
}