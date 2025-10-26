package ai.snippetquiz.core_service.quiz.application.service;

import ai.snippetquiz.core_service.quiz.application.dto.request.CreateQuizDTO;
import ai.snippetquiz.core_service.quiz.application.dto.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.quiz.application.dto.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.quiz.application.dto.response.QuizResponse;
import ai.snippetquiz.core_service.quiz.application.dto.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.quiz.application.dto.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.quiz.application.dto.response.UpdateQuizDateResponse;
import ai.snippetquiz.core_service.quiz.application.dto.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;

import java.util.UUID;

public interface QuizService {
    PagedModel<QuizResponse> findAll(UUID userId, Pageable pageable);

    FindOneQuizResponse findOne(UUID userId, Long id);

    PagedModel<QuizResponseItemDto> findQuizResponses(UUID userId, Long quizId, Pageable pageable);

    QuizSummaryResponseDto findQuizSummary(Long id, UUID userId);

    UpdateQuizDateResponse updateQuizDate(Long quizId);

    CheckQuizInProgressResponse checkQuizInProgress(UUID userId);

    void remove(UUID userId, Long id);

    Long createQuiz(UUID userId, CreateQuizDTO request);

    void processNewQuizQuestions(Quiz quiz, QuizStatus status);

    void createQuizQuestions(Quiz quiz);

    UpdateQuizResponse updateQuiz(UUID userId, Long quizId, Long optionSelectedId);

}