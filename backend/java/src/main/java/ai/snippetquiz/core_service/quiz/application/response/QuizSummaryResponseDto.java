package ai.snippetquiz.core_service.quiz.application.response;

import java.util.List;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class QuizSummaryResponseDto implements Response {
    List<String> topics;
    Integer totalQuestions;
    Integer totalCorrectAnswers;
}
