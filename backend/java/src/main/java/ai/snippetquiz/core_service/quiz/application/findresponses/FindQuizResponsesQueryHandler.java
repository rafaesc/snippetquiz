package ai.snippetquiz.core_service.quiz.application.findresponses;

import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.quiz.application.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FindQuizResponsesQueryHandler implements QueryHandler<FindQuizResponsesQuery, PagedModelResponse<QuizResponseItemDto>> {
    private final QuizService quizService;

    @Override
    public PagedModelResponse<QuizResponseItemDto> handle(FindQuizResponsesQuery query) {
        return quizService.findQuizResponses(
                new UserId(query.getUserId()),
                new QuizId(query.getQuizId()),
                query.getPageable());
    }
}