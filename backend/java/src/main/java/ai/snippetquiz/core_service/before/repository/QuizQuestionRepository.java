package ai.snippetquiz.core_service.before.repository;

import ai.snippetquiz.core_service.before.entity.QuizQuestion;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    List<QuizQuestion> findByQuizId(Long quizId, Pageable pageable);
}