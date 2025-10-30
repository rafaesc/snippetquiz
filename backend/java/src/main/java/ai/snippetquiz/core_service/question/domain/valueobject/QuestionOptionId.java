package ai.snippetquiz.core_service.question.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class QuestionOptionId extends BaseId<Long> {
    public QuestionOptionId(Long value) {
        super(value);
    }
}