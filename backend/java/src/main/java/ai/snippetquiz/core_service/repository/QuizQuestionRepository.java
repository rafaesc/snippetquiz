package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.QuizQuestion;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    List<QuizQuestion> findByQuizId(Long quizId, Pageable pageable);
}