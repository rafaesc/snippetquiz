package ai.snippetquiz.core_service.quiz.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionOption {
    private Long id;
    private QuizQuestion quizQuestion;
    private String optionText;
    private String optionExplanation;
    private Boolean isCorrect = false;
    private List<QuizQuestionResponse> quizQuestionResponses;

    public QuizQuestionOption(QuizQuestion quizQuestion, String optionText, String optionExplanation, Boolean isCorrect) {
        this.quizQuestion = quizQuestion;
        this.optionText = optionText;
        this.optionExplanation = optionExplanation;
        this.isCorrect = isCorrect;
    }
}