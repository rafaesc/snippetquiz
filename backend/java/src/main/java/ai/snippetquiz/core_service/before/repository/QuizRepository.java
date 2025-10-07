package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.Quiz;
import ai.snippetquiz.core_service.before.entity.QuizStatus;

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
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findAllByUserIdAndStatus(UUID userId, QuizStatus status);
    
    Page<Quiz> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.quizTopics WHERE q.id = :id AND q.userId = :userId")
    Optional<Quiz> findByIdAndUserIdWithTopics(@Param("id") Long id, @Param("userId") UUID userId);
    
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.quizQuestions WHERE q.id = :id AND q.userId = :userId")
    Optional<Quiz> findByIdAndUserIdWithQuestions(@Param("id") Long id, @Param("userId") UUID userId);

    Optional<Quiz> findByIdAndUserId(Long id, UUID userId);
}