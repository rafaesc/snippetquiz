package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentEntryTopic {
    private Long id;
    private ContentEntryId contentEntryId;
    private Long topicId;

    public ContentEntryTopic(ContentEntryId contentEntryId, Long topicId) {
        this.contentEntryId = contentEntryId;
        this.topicId = topicId;
    }
}
