package ai.snippetquiz.core_service.quiz.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private Quiz quiz;
    private QuizQuestion quizQuestion;
    private QuizQuestionOption quizQuestionOption;
    private Boolean isCorrect;
    private String correctAnswer;
    private String responseTime;

    public QuizQuestionResponse(Quiz quiz, QuizQuestion quizQuestion, QuizQuestionOption quizQuestionOption,
                                Boolean isCorrect, String correctAnswer, String responseTime) {
        this.quiz = quiz;
        this.quizQuestion = quizQuestion;
        this.quizQuestionOption = quizQuestionOption;
        this.isCorrect = isCorrect;
        this.correctAnswer = correctAnswer;
        this.responseTime = responseTime;
    }
}