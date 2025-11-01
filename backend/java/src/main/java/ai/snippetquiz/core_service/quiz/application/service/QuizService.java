package ai.snippetquiz.core_service.quiz.application.service;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.application.response.CheckQuizInProgressResponse;
import ai.snippetquiz.core_service.quiz.application.response.FindOneQuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponse;
import ai.snippetquiz.core_service.quiz.application.response.QuizResponseItemDto;
import ai.snippetquiz.core_service.quiz.application.response.QuizSummaryResponseDto;
import ai.snippetquiz.core_service.quiz.application.response.UpdateQuizResponse;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Pageable;
import ai.snippetquiz.core_service.shared.domain.bus.query.PagedModelResponse;

public interface QuizService {
    PagedModelResponse<QuizResponse> findAll(UserId userId, Pageable pageable);

    FindOneQuizResponse findOne(UserId userId, QuizId quizId);

    PagedModelResponse<QuizResponseItemDto> findQuizResponses(UserId userId, QuizId quizId, Pageable pageable);

    QuizSummaryResponseDto findQuizSummary(QuizId quizId, UserId userId);

    CheckQuizInProgressResponse checkQuizInProgress(UserId userId);

    void remove(UserId userId, QuizId quizId);

    void createQuiz(UserId userId, ContentBankId contentBankId, QuizId quizId);

    void processNewQuizQuestions(Quiz quiz, QuizStatus status);

    void createQuizQuestions(Quiz quiz, QuizStatus status);

    UpdateQuizResponse updateQuiz(UserId userId, QuizId quizId, Long optionSelectedId);

}