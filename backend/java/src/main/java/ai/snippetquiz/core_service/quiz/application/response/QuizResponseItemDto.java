package ai.snippetquiz.core_service.quiz.application.response;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class QuizResponseItemDto implements Response {
    Boolean isCorrect;
    String question;
    String answer;
    String correctAnswer;
    String explanation;
    String sourceUrl;
}
