package ai.snippetquiz.core_service.question.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper=true)
public class QuestionContentEntryChunkId extends BaseId<Integer> {
    public QuestionContentEntryChunkId(Integer value) {
        super(value);
    }
}
