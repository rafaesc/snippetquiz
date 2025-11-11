package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private QuizQuestionId quizQuestion;
    private QuizQuestionOptionId quizQuestionOption;
    private Boolean isCorrect;
    private String correctAnswer;
    private String responseTime;
}