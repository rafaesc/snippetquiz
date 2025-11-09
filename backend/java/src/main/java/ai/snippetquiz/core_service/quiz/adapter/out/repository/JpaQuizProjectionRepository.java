package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizProjectionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaQuizProjectionRepository extends JpaRepository<QuizProjectionEntity, UUID> {
    List<QuizProjectionEntity> findAllByUserIdAndStatus(UUID userId, QuizStatus status);
    
    Page<QuizProjectionEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}