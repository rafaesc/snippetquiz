package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class QuizQuestionOption {
    private QuizQuestionOptionId id;
    private String optionText;
    private String optionExplanation;
    private Boolean isCorrect = false;

    public QuizQuestionOption() {
        this.id = new QuizQuestionOptionId(UUID.randomUUID());
    }
}