package ai.snippetquiz.core_service.topic.adapter.out.repository;

import ai.snippetquiz.core_service.topic.adapter.out.entities.TopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaTopicRepository extends JpaRepository<TopicEntity, Long> {
    List<TopicEntity> findAllByIdInAndUserId(List<Long> ids, UUID userId);

    Optional<TopicEntity> findByUserIdAndTopic(UUID userId, String topic);
    
    List<TopicEntity> findAllByUserId(UUID userId);
    
    List<TopicEntity> findByUserIdAndTopicIn(UUID userId, List<String> topics);

    List<TopicEntity> findByUserIdAndIdIn(UUID userId, List<Long> ids);
}