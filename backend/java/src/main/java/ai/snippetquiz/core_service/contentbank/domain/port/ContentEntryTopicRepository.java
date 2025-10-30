package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;

public interface ContentEntryTopicRepository {
    ContentEntryTopic save(ContentEntryTopic contentEntryTopic);

    List<ContentEntryTopic> findByContentEntryId(ContentEntryId contentEntryId);

    List<ContentEntryTopic> findByTopicId(TopicId topicId);

    List<ContentEntryTopic> findByContentEntryIdIn(List<ContentEntryId> contentEntryId);
    
    void deleteByContentEntryId(ContentEntryId contentEntryId);
}
