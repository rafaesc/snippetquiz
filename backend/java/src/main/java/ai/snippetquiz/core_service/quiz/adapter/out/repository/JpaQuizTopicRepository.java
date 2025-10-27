package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizTopicEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaQuizTopicRepository extends JpaRepository<QuizTopicEntity, Long> {
    List<QuizTopicEntity> findByQuizId(UUID quizId);
    
    void deleteByQuizId(UUID quizId);
    
    Optional<QuizTopicEntity> findByQuizIdAndTopicName(UUID quizId, String topicName);
}