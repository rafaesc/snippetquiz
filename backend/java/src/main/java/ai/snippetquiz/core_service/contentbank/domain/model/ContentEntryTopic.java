package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryTopicId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ContentEntryTopic extends BaseEntity<ContentEntryTopicId> {
    private ContentEntryId contentEntryId;
    private TopicId topicId;
}
