package ai.snippetquiz.core_service.quiz.application.findsummary;

import org.springframework.stereotype.Service;
import ai.snippetquiz.core_service.quiz.application.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindQuizSummaryQueryHandler implements QueryHandler<FindQuizSummaryQuery, QuizSummaryResponseDto> {
    private final QuizService quizService;

    @Override
    public QuizSummaryResponseDto handle(FindQuizSummaryQuery query) {
        return quizService.findQuizSummary(new QuizId(query.getQuizId()), new UserId(query.getUserId()));
    }
}