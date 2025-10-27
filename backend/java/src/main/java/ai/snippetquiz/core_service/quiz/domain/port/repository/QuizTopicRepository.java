package ai.snippetquiz.core_service.quiz.domain.port.repository;


import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;

import java.util.List;
import java.util.Optional;


public interface QuizTopicRepository {
    QuizTopic save(QuizTopic quizTopic);
    
    List<QuizTopic> findByQuizId(QuizId quizId);
    
    void deleteByQuizId(QuizId quizId);
    
    Optional<QuizTopic> findByQuizIdAndTopicName(QuizId quizId, String topicName);
}