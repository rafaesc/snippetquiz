package ai.snippetquiz.core_service.quiz.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionOption {
    private Long id;
    private Long quizQuestionId;
    private String optionText;
    private String optionExplanation;
    private Boolean isCorrect = false;

    public QuizQuestionOption(Long quizQuestionId, String optionText, String optionExplanation, Boolean isCorrect) {
        this.quizQuestionId = quizQuestionId;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}