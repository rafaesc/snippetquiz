package ai.snippetquiz.core_service.topic.domain.port;


import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;

import java.util.List;
import java.util.Optional;

public interface TopicRepository  {
    Topic save(Topic topic);

    List<Topic> findAllByIdInAndUserId(List<Long> ids, UserId userId);
    
    Optional<Topic> findByUserIdAndTopic(UserId userId, String topic);
    
    List<Topic> findAllByUserId(UserId userId);
    
    List<Topic> findByUserIdAndTopicIn(UserId userId, List<String> topics);

    List<Topic> findByUserIdAndIdIn(UserId userId, List<Long> ids);
}