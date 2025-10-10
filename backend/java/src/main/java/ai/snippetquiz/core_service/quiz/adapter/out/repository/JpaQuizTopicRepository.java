package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizTopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaQuizTopicRepository extends JpaRepository<QuizTopicEntity, Long> {
    List<QuizTopicEntity> findByQuizId(Long quizId);
    
    void deleteByQuizId(Long quizId);
    
    Optional<QuizTopicEntity> findByQuizIdAndTopicName(Long quizId, String topicName);
}