package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaQuizRepository extends JpaRepository<QuizEntity, Long> {
    List<QuizEntity> findAllByUserIdAndStatus(UUID userId, QuizStatus status);
    
    Page<QuizEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    @Query("SELECT q FROM QuizEntity q LEFT JOIN FETCH q.quizTopics WHERE q.id = :id AND q.userId = :userId")
    Optional<QuizEntity> findByIdAndUserIdWithTopics(@Param("id") Long id, @Param("userId") UUID userId);
    
    @Query("SELECT q FROM QuizEntity q LEFT JOIN FETCH q.quizQuestions WHERE q.id = :id AND q.userId = :userId")
    Optional<QuizEntity> findByIdAndUserIdWithQuestions(@Param("id") Long id, @Param("userId") UUID userId);
    
    Optional<QuizEntity> findByIdAndUserId(Long id, UUID userId);
}