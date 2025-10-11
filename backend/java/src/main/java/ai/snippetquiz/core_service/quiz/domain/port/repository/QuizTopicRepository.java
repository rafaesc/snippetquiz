package ai.snippetquiz.core_service.quiz.domain.port.repository;


import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;

import java.util.List;
import java.util.Optional;


public interface QuizTopicRepository {
    QuizTopic save(QuizTopic quizTopic);
    
    List<QuizTopic> findByQuizId(Long quizId);
    
    void deleteByQuizId(Long quizId);
    
    Optional<QuizTopic> findByQuizIdAndTopicName(Long quizId, String topicName);
}