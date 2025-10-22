package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class QuizId extends BaseId<Long> {
    public QuizId(Long value) {
        super(value);
    }
}
