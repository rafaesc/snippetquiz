package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.QuizQuestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionResponseRepository extends JpaRepository<QuizQuestionResponse, Long> {
    
    // Find responses by quiz ID and user ID
    List<QuizQuestionResponse> findByQuizIdAndQuizUserId(Long quizId, UUID userId);
    
    // Count responses by quiz ID
    long countByQuizId(Long quizId);
    
    // Find responses with question details
    @Query("SELECT qr FROM QuizQuestionResponse qr LEFT JOIN FETCH qr.quizQuestion WHERE qr.quiz.id = :quizId")
    Page<QuizQuestionResponse> findByQuizIdWithDetailsOrderByCreatedAtDesc(@Param("quizId") Long quizId, Pageable pageable);
    
    @Query("SELECT COUNT(qr) FROM QuizQuestionResponse qr WHERE qr.quiz.id = :quizId AND qr.isCorrect = :isCorrect")
    Integer countByQuizIdAndIsCorrect(@Param("quizId") Long quizId, @Param("isCorrect") Boolean isCorrect);
}