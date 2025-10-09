package ai.snippetquiz.core_service.contentbank.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentEntryTopic {
    private Long id;
    private ContentEntry contentEntry;
    private Long topicId;
}
