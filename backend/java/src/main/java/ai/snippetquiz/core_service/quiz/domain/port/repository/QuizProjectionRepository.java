package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizProjectionRepository {
    List<QuizProjection> findAllByUserIdAndStatus(UserId userId, QuizStatus status);
    
    Page<QuizProjection> findByUserIdOrderByCreatedAtDesc(UserId userId, Pageable pageable);
}