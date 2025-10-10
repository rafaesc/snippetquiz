package ai.snippetquiz.core_service.topic.domain.port;


import ai.snippetquiz.core_service.topic.domain.Topic;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository  {
    Topic save(Topic topic);

    List<Topic> findAllByIdInAndUserId(List<Long> ids, UUID userId);
    
    Optional<Topic> findByUserIdAndTopic(UUID userId, String topic);
    
    List<Topic> findAllByUserId(UUID userId);
    
    List<Topic> findByUserIdAndTopicIn(UUID userId, List<String> topics);
}