package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.question.domain.QuestionOption;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionOption {
    private Long id;
    private String optionText;
    private String optionExplanation;
    private Boolean isCorrect = false;

    public QuizQuestionOption(QuestionOption questionOption) {
        this.optionText = questionOption.getOptionText();
        this.optionExplanation = questionOption.getOptionExplanation();
        this.isCorrect = questionOption.getIsCorrect();
    }
}