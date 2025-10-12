package ai.snippetquiz.core_service.quiz.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private Long id;
    private Long quizId;
    private UUID userId;
    private QuizQuestion quizQuestion;
    private QuizQuestionOption quizQuestionOption;
    private Boolean isCorrect;
    private String correctAnswer;
    private String responseTime;

    public QuizQuestionResponse(Long quizId, UUID userId, QuizQuestion quizQuestion, QuizQuestionOption quizQuestionOption,
                                Boolean isCorrect, String correctAnswer, String responseTime) {
        this.quizId = quizId;
        this.userId = userId;
        this.quizQuestion = quizQuestion;
        this.quizQuestionOption = quizQuestionOption;
        this.isCorrect = isCorrect;
        this.correctAnswer = correctAnswer;
        this.responseTime = responseTime;
    }
}