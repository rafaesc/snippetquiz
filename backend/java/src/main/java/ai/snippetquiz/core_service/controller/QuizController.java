package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.CreateQuizDTO;
import ai.snippetquiz.core_service.dto.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.dto.response.CreateQuizResponse;
import ai.snippetquiz.core_service.dto.request.CreateQuizRequest;
import ai.snippetquiz.core_service.dto.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.dto.response.QuizResponse;
import ai.snippetquiz.core_service.dto.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.dto.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.entity.QuizStatus;
import ai.snippetquiz.core_service.dto.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.exception.ConflictException;
import ai.snippetquiz.core_service.service.QuizService;
import ai.snippetquiz.core_service.util.Constants;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
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

import java.util.UUID;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/validate")
    public CheckQuizInProgressResponse checkQuizInProgress(
            @RequestHeader(Constants.USER_ID_HEADER) String userId) {
        return quizService.checkQuizInProgress(UUID.fromString(userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateQuizResponse createQuiz(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @Valid @RequestBody CreateQuizRequest request) {
        var checkQuizInProgressResponse = quizService.checkQuizInProgress(UUID.fromString(userId));
        if (checkQuizInProgressResponse.inProgress()) {
            throw new ConflictException("Quiz in progress");
        }

        var createQuizDto = new CreateQuizDTO(
                request.bankId(),
                request.quizId(),
                QuizStatus.PREPARE);

        var quizId = quizService.createQuiz(UUID.fromString(userId), createQuizDto);
        quizService.emitCreateQuizEvent(userId, quizId, request.bankId());

        return new CreateQuizResponse(quizId);
    }

    @GetMapping
    public PagedModel<QuizResponse> findAll(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) @SortDefault(sort = "createdAt", direction = Direction.DESC) Pageable pageable) {

        return quizService.findAll(UUID.fromString(userId), pageable);
    }

    @GetMapping("/{id}")
    public FindOneQuizResponse findOne(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        return quizService.findOne(UUID.fromString(userId), id);
    }

    @PutMapping("/{id}/option/{questionOptionId}")
    @ResponseStatus(HttpStatus.OK)
    public UpdateQuizResponse updateQuiz(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @Valid @PathVariable @NotNull(message = "Question option ID cannot be null") String questionOptionId) {
        return quizService.updateQuiz(UUID.fromString(userId), id, questionOptionId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable Long id) {
        quizService.remove(UUID.fromString(userId), id);
    }

    @GetMapping("/{id}/responses")
    public PagedModel<QuizResponseItemDto> findQuizResponses(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id,
            @PageableDefault(size = Constants.DEFAULT_LIMIT) Pageable pageable) {
        return quizService.findQuizResponses(UUID.fromString(userId), id, pageable);
    }

    @GetMapping("/{id}/summary")
    public QuizSummaryResponseDto findQuizSummary(
            @RequestHeader(Constants.USER_ID_HEADER) String userId,
            @PathVariable String id) {
        return quizService.findQuizSummary(Long.parseLong(id), UUID.fromString(userId));
    }
}