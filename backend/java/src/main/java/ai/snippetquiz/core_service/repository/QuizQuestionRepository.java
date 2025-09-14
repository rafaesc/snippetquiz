package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    // Find questions by quiz ID
    List<QuizQuestion> findByQuizId(Long quizId);
    
    // Count questions by content bank ID and user ID
    @Query("SELECT COUNT(qq) FROM QuizQuestion qq JOIN qq.quiz q WHERE q.contentBank.id = :bankId AND q.userId = :userId")
    long countByContentBankIdAndUserId(@Param("bankId") Long bankId, @Param("userId") UUID userId);
    
    // Find questions with options by quiz ID
    @Query("SELECT qq FROM QuizQuestion qq LEFT JOIN FETCH qq.quizQuestionOptions WHERE qq.quiz.id = :quizId")
    List<QuizQuestion> findByQuizIdWithOptions(@Param("quizId") Long quizId);
}