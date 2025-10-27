package ai.snippetquiz.core_service.quiz.application.findall;

import org.springframework.stereotype.Service;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponse;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindAllQuizzesQueryHandler implements QueryHandler<FindAllQuizzesQuery, PagedModelResponse<QuizResponse>> {
    private final QuizService quizService;

    @Override
    public PagedModelResponse<QuizResponse> handle(FindAllQuizzesQuery query) {
        return quizService.findAll(new UserId(query.getUserId()), query.getPageable());
    }
}