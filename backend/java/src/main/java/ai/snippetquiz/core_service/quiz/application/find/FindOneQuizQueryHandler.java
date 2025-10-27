package ai.snippetquiz.core_service.quiz.application.find;

import org.springframework.stereotype.Service;
import ai.snippetquiz.core_service.quiz.application.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindOneQuizQueryHandler implements QueryHandler<FindOneQuizQuery, FindOneQuizResponse> {
    private final QuizService quizService;

    @Override
    public FindOneQuizResponse handle(FindOneQuizQuery query) {
        return quizService.findOne(new UserId(query.getUserId()), new QuizId(query.getId()));
    }
}