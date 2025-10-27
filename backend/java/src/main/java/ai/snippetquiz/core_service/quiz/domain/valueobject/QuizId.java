package ai.snippetquiz.core_service.quiz.domain.valueobject;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

public class QuizId extends BaseId<UUID> {
    public QuizId(UUID value) {
        super(value);
    }
    public static QuizId map(String value) {
        return new QuizId(UUID.fromString(value));
    }
}
