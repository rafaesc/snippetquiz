package ai.snippetquiz.core_service.repository;

import ai.snippetquiz.core_service.entity.QuizTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizTopicRepository extends JpaRepository<QuizTopic, Long> {
    
    List<QuizTopic> findByQuizId(Long quizId);
    
    void deleteByQuizId(Long quizId);
    
    Optional<QuizTopic> findByQuizIdAndTopicName(Long quizId, String topicName);
}