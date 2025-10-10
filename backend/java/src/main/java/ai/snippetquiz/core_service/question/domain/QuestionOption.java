package ai.snippetquiz.core_service.question.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOption {
    private Long id;
    private Question question;
    private String optionText;
    private String optionExplanation;
    private Boolean isCorrect = false;

    public QuestionOption(Question question, String optionText, String optionExplanation, Boolean isCorrect) {
        this.question = question;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}