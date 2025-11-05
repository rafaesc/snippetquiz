package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

import java.util.UUID;

public class QuizQuestionId extends BaseId<UUID> {
    public QuizQuestionId(UUID value) {
        super(value);
    }
    public static QuizQuestionId map(String value) {
        return new QuizQuestionId(UUID.fromString(value));
    }
}
