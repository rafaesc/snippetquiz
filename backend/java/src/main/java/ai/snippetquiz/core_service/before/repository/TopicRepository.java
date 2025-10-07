package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    Optional<Topic> findByUserIdAndTopic(UUID userId, String topic);
    
    List<Topic> findAllByUserId(UUID userId);
    
    List<Topic> findByUserIdAndTopicIn(UUID userId, List<String> topics);
}