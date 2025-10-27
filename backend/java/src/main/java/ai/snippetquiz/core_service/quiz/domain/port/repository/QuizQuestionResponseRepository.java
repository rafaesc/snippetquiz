package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuizQuestionResponseRepository {
    QuizQuestionResponse save(QuizQuestionResponse quizQuestionResponse);

    Page<QuizQuestionResponse> findByQuiz_IdAndQuiz_UserId(QuizId quizId, UserId userId, Pageable pageable);

    Integer countByQuizIdAndIsCorrect(QuizId quizId, Boolean isCorrect);
}