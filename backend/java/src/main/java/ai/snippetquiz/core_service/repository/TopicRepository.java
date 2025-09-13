package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    // Find topic by user ID and topic name
    Optional<Topic> findByUserIdAndTopic(UUID userId, String topic);
    
    // Find all topics for a user
    List<Topic> findAllByUserId(UUID userId);
    
    // Find topics by names for a user
    List<Topic> findByUserIdAndTopicIn(UUID userId, List<String> topics);
}