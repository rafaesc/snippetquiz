package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizQuestionRepository {

    QuizQuestion save(QuizQuestion quizQuestion);
    
    List<QuizQuestion> findByQuizId(Long quizId, Pageable pageable);
    List<QuizQuestion> findByQuizId(Long quizId);
    boolean existsByChunkIndexAndQuestionIndexInChunk(Integer chunkIndex, Integer questionIndexInChunk);
}