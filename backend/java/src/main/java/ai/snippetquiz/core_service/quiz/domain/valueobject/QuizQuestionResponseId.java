package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

import java.util.UUID;

public class QuizQuestionResponseId extends BaseId<UUID> {
    public QuizQuestionResponseId(UUID value) {
        super(value);
    }
    public static QuizQuestionResponseId map(String value) {
        return new QuizQuestionResponseId(UUID.fromString(value));
    }
}
