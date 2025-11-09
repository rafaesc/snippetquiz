package ai.snippetquiz.core_service.question.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class QuestionId extends BaseId<Long> {
    public QuestionId(Long value) {
        super(value);
    }
}