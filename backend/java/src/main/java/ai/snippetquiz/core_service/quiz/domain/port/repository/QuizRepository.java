package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizRepository {
    Quiz save(Quiz quiz);

    void delete(Quiz quiz);

    Optional<Quiz> findById(Long id);

    List<Quiz> findAllByUserIdAndStatus(UUID userId, QuizStatus status);
    
    Page<Quiz> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<Quiz> findByIdAndUserIdWithTopics(Long id, UUID userId);

    Optional<Quiz> findByIdAndUserIdWithQuestions(Long id, UUID userId);

    Optional<Quiz> findByIdAndUserId(Long id, UUID userId);
}