package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface QuizRepository {
    Quiz save(Quiz quiz);

    void delete(Quiz quiz);

    Optional<Quiz> findById(QuizId id);

    List<Quiz> findAllByUserIdAndStatus(UserId userId, QuizStatus status);
    
    Page<Quiz> findByUserIdOrderByCreatedAtDesc(UserId userId, Pageable pageable);

    Optional<Quiz> findByIdAndUserIdWithTopics(QuizId id, UserId userId);

    Optional<Quiz> findByIdAndUserIdWithQuestions(QuizId id, UserId userId);

    Optional<Quiz> findByIdAndUserId(QuizId id, UserId userId);
}