package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface QuizQuestionResponseRepository {
    QuizQuestionResponse save(QuizQuestionResponse quizQuestionResponse);

    Page<QuizQuestionResponse> findByQuiz_IdAndQuiz_UserId(Long quizId, UUID userId, Pageable pageable);

    Integer countByQuizIdAndIsCorrect(Long quizId, Boolean isCorrect);
}