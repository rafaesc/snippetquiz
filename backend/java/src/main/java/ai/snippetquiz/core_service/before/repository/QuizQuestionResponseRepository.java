package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.QuizQuestionResponse;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizQuestionResponseRepository extends JpaRepository<QuizQuestionResponse, Long> {
    Page<QuizQuestionResponse> findByQuiz_IdAndQuiz_UserId(@Param("quizId") Long quizId, @Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(qr) FROM QuizQuestionResponse qr WHERE qr.quiz.id = :quizId AND qr.isCorrect = :isCorrect")
    Integer countByQuizIdAndIsCorrect(@Param("quizId") Long quizId, @Param("isCorrect") Boolean isCorrect);
}