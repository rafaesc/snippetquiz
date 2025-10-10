package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JpaQuizQuestionResponseRepository extends JpaRepository<QuizQuestionResponseEntity, Long> {
    Page<QuizQuestionResponseEntity> findByQuiz_IdAndQuiz_UserId(@Param("quizId") Long quizId, @Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(qr) FROM QuizQuestionResponseEntity qr WHERE qr.quiz.id = :quizId AND qr.isCorrect = :isCorrect")
    Integer countByQuizIdAndIsCorrect(@Param("quizId") Long quizId, @Param("isCorrect") Boolean isCorrect);
}