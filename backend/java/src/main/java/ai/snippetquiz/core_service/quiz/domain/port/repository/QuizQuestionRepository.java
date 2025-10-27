package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;

import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizQuestionRepository {

    QuizQuestion save(QuizQuestion quizQuestion);
    
    List<QuizQuestion> findByQuizId(QuizId quizId, Pageable pageable);
    List<QuizQuestion> findByQuizId(QuizId quizId);
    boolean existsByChunkIndexAndQuestionIndexInChunk(Integer chunkIndex, Integer questionIndexInChunk);
}