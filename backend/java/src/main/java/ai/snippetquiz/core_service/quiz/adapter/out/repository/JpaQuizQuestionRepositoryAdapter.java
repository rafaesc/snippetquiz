package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizQuestionMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizQuestionRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaQuizQuestionRepositoryAdapter implements QuizQuestionRepository {
    private final JpaQuizQuestionRepository jpaQuizQuestionRepository;
    private final QuizQuestionMapper quizQuestionMapper;

    @Override
    public QuizQuestion save(QuizQuestion quizQuestion) {
        QuizQuestionEntity entity = quizQuestionMapper.toEntity(quizQuestion);
        QuizQuestionEntity savedEntity = jpaQuizQuestionRepository.save(entity);
        return quizQuestionMapper.toDomain(savedEntity);
    }

    @Override
    public List<QuizQuestion> findByQuizId(QuizId quizId, Pageable pageable) {
        return jpaQuizQuestionRepository.findByQuizId(quizId.getValue(), pageable)
                .stream()
                .map(quizQuestionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizQuestion> findByQuizId(QuizId quizId) {
        return jpaQuizQuestionRepository.findByQuizId(quizId.getValue())
                .stream()
                .map(quizQuestionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByChunkIndexAndQuestionIndexInChunk(Integer chunkIndex, Integer questionIndexInChunk) {
        return jpaQuizQuestionRepository.existsByChunkIndexAndQuestionIndexInChunk(chunkIndex, questionIndexInChunk);
    }
}