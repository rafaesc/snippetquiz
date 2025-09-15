package ai.snippetquiz.core_service.controller;

import ai.snippetquiz.core_service.dto.request.CreateQuizRequest;
import ai.snippetquiz.core_service.dto.request.FindQuizResponsesRequest;
import ai.snippetquiz.core_service.dto.request.UpdateQuizRequest;
import ai.snippetquiz.core_service.dto.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.dto.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.dto.response.PaginatedQuizzesResponse;
import ai.snippetquiz.core_service.dto.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.exception.ConflictException;
import ai.snippetquiz.core_service.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/check-in-progress")
    public ResponseEntity<CheckQuizInProgressResponse> checkQuizInProgress(
            @RequestHeader("X-User-Id") String userId) {
        CheckQuizInProgressResponse response = quizService.checkQuizInProgress(UUID.fromString(userId));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Void> createQuiz(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CreateQuizRequest request) {
        var checkQuizInProgressResponse = quizService.checkQuizInProgress(UUID.fromString(userId));
        if (checkQuizInProgressResponse.inProgress()) {
            throw new ConflictException("Quiz in progress");
        }

        var quizId = quizService.createQuiz(UUID.fromString(userId), request);
        quizService.emitCreateQuizEvent(userId, quizId, request.bankId());

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<PaginatedQuizzesResponse> findAll(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit) {

        PaginatedQuizzesResponse response = quizService.findAll(UUID.fromString(userId), page, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FindOneQuizResponse> findOne(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String id) {
        FindOneQuizResponse response = quizService.findOne(UUID.fromString(userId), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UpdateQuizResponse> updateQuiz(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String id,
            @Valid @RequestBody UpdateQuizRequest request) {
        UpdateQuizResponse response = quizService.updateQuiz(UUID.fromString(userId), id, request.questionOptionId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id) {
        quizService.remove(UUID.fromString(userId), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/responses")
    public ResponseEntity<Object> findQuizResponses(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String id,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit) {

        FindQuizResponsesRequest request = new FindQuizResponsesRequest();
        request.setPage(page);
        request.setLimit(limit);
        request.setQuizId(id);

        Object response = quizService.findQuizResponses(UUID.fromString(userId), request);
        return ResponseEntity.ok(response);
    }
}