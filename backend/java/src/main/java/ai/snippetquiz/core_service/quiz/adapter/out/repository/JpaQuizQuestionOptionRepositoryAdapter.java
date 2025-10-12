package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionOptionEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizQuestionOptionMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizQuestionOptionRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JpaQuizQuestionOptionRepositoryAdapter implements QuizQuestionOptionRepository {
    private final JpaQuizQuestionOptionRepository jpaQuizQuestionOptionRepository;
    private final QuizQuestionOptionMapper quizQuestionOptionMapper;

    @Override
    public QuizQuestionOption save(QuizQuestionOption quizQuestionOption) {
        QuizQuestionOptionEntity entity = quizQuestionOptionMapper.toEntity(quizQuestionOption);
        QuizQuestionOptionEntity savedEntity = jpaQuizQuestionOptionRepository.save(entity);
        return quizQuestionOptionMapper.toDomain(savedEntity);
    }

    @Override
    public List<QuizQuestionOption> findByQuizQuestionId(Long quizQuestionId) {
        List<QuizQuestionOptionEntity> entities = jpaQuizQuestionOptionRepository.findByQuizQuestionId(quizQuestionId);
        return entities.stream()
                .map(quizQuestionOptionMapper::toDomain)
                .toList();
    }
}