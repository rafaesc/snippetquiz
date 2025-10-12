package ai.snippetquiz.core_service.contentbank.domain.port;

import java.util.List;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;

public interface ContentEntryTopicRepository {
    ContentEntryTopic save(ContentEntryTopic contentEntryTopic);

    List<ContentEntryTopic> findByContentEntryId(Long contentEntryId);

    List<ContentEntryTopic> findByTopicId(Long topicId);

    List<ContentEntryTopic> findByContentEntryIdIn(List<Long> contentEntryId);
    
    void deleteByContentEntryId(Long contentEntryId);
}
