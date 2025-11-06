package ai.snippetquiz.core_service.quiz.application.response;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

@AllArgsConstructor
@Getter
public class QuizSummaryResponseDto implements Response {
    Set<String> topics;
    Integer totalQuestions;
    Integer totalCorrectAnswers;
}
