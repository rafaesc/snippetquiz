package ai.snippetquiz.core_service.topic.adapter.out.repository;

import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.adapter.out.entities.TopicEntity;
import ai.snippetquiz.core_service.topic.adapter.out.mapper.TopicMapper;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

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
    public Optional<Topic> findByUserIdAndTopic(UserId userId, String topic) {
        return jpaTopicRepository.findByUserIdAndTopic(userId.getValue(), topic)
                .map(topicMapper::toDomain);
    }

    @Override
    public List<Topic> findAllByUserId(UserId userId) {
        return jpaTopicRepository.findAllByUserId(userId.getValue()).stream()
                .map(topicMapper::toDomain)
                .toList();
    }

    @Override
    public List<Topic> findByUserIdAndTopicIn(UserId userId, List<String> topics) {
        return jpaTopicRepository.findByUserIdAndTopicIn(userId.getValue(), topics).stream()
                .map(topicMapper::toDomain)
                .toList();
    }

    @Override
    public List<Topic> findByUserIdAndIdIn(UserId userId, List<TopicId> ids) {
        return jpaTopicRepository.findByUserIdAndIdIn(userId.getValue(), ids.stream().map(TopicId::getValue).toList()).stream()
                .map(topicMapper::toDomain)
                .toList();
    }

    @Override
    public List<Topic> findAllByIdInAndUserId(List<TopicId> ids, UserId userId) {
        return jpaTopicRepository.findAllByIdInAndUserId(ids.stream().map(TopicId::getValue).toList(), userId.getValue()).stream()
                .map(topicMapper::toDomain)
                .toList();
    }
}