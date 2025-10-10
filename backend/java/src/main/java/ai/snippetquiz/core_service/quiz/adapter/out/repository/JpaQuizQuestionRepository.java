package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaQuizQuestionRepository extends JpaRepository<QuizQuestionEntity, Long> {
    List<QuizQuestionEntity> findByQuizId(Long quizId, Pageable pageable);
}