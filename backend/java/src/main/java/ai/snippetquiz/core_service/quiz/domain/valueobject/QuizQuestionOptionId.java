package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

import java.util.UUID;

public class QuizQuestionOptionId extends BaseId<UUID> {
    public QuizQuestionOptionId(UUID value) {
        super(value);
    }
    public static QuizQuestionOptionId map(String value) {
        return new QuizQuestionOptionId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return getValue().toString();
    }
}
