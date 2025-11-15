package ai.snippetquiz.core_service.quiz.adapter.in.web;

import ai.snippetquiz.core_service.quiz.adapter.in.web.request.CreateQuizRequest;
import ai.snippetquiz.core_service.quiz.application.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.quiz.application.response.CreateQuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.quiz.application.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.quiz.application.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.quiz.application.create.CreateQuizCommand;
import ai.snippetquiz.core_service.quiz.application.find.FindOneQuizQuery;
import ai.snippetquiz.core_service.quiz.application.findall.FindAllQuizzesQuery;
import ai.snippetquiz.core_service.quiz.application.findresponses.FindQuizResponsesQuery;
import ai.snippetquiz.core_service.quiz.application.findsummary.FindQuizSummaryQuery;
import ai.snippetquiz.core_service.quiz.application.delete.DeleteQuizCommand;
import ai.snippetquiz.core_service.quiz.application.validate.CheckQuizInProgressQuery;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import ai.snippetquiz.core_service.shared.domain.DomainError;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryBus;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.spring.ApiController;
import ai.snippetquiz.core_service.shared.util.Constants;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/quiz")
public class QuizController extends ApiController {
    private final QuizService quizService;

    public QuizController(
            QuizService quizService,
            QueryBus queryBus,
            CommandBus commandBus) {
        super(queryBus, commandBus);
        this.quizService = quizService;
    }

    @GetMapping("/validate")
    public CheckQuizInProgressResponse checkQuizInProgress(
            @RequestHeader(Constants.USER_ID_HEADER) String userId) {
        return ask(new CheckQuizInProgressQuery(UUID.fromString(userId)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateQuizResponse createQuiz(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @RequestBody CreateQuizRequest request) {
        dispatch(new CreateQuizCommand(
                UUID.fromString(userId),
                UUID.fromString(request.bankId()),
                UUID.fromString(request.quizId())
        ));
        return new CreateQuizResponse(request.quizId());
    }

    @GetMapping
    public PagedModelResponse<QuizResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        return ask(new FindAllQuizzesQuery(UUID.fromString(userId), pageable));
    }

    @GetMapping("/{id}")
    public FindOneQuizResponse findOne(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        return ask(new FindOneQuizQuery(UUID.fromString(userId), UUID.fromString(id)));
    }

    @PutMapping("/{id}/option/{questionOptionId}")
    @ResponseStatus(HttpStatus.OK)
    public UpdateQuizResponse updateQuiz(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @PathVariable @NotNull(message = "Question option ID cannot be null") String questionOptionId) {
        return quizService.updateQuiz(UserId.map(userId), QuizId.map(id), QuizQuestionOptionId.map(questionOptionId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        dispatch(new DeleteQuizCommand(UUID.fromString(userId), UUID.fromString(id)));
    }

    @GetMapping("/{id}/responses")
    public PagedModelResponse<QuizResponseItemDto> findQuizResponses(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) Pageable pageable) {
        return ask(new FindQuizResponsesQuery(UUID.fromString(userId), UUID.fromString(id), pageable));
    }

    @GetMapping("/{id}/summary")
    public QuizSummaryResponseDto findQuizSummary(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        return ask(new FindQuizSummaryQuery(UUID.fromString(userId), UUID.fromString(id)));
    }

    @Override
    public HashMap<Class<? extends DomainError>, HttpStatus> errorMapping() {
        return null;
    }
}
