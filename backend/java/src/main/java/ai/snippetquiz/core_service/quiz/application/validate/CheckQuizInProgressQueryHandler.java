package ai.snippetquiz.core_service.quiz.application.validate;

import org.springframework.stereotype.Service;
import ai.snippetquiz.core_service.quiz.application.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CheckQuizInProgressQueryHandler implements QueryHandler<CheckQuizInProgressQuery, CheckQuizInProgressResponse> {
    private final QuizService quizService;

    @Override
    public CheckQuizInProgressResponse handle(CheckQuizInProgressQuery query) {
        return quizService.checkQuizInProgress(new UserId(query.getUserId()));
    }
}