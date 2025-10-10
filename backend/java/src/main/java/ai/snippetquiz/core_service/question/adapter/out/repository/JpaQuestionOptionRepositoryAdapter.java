package ai.snippetquiz.core_service.question.adapter.out.repository;

import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionOptionEntity;
import ai.snippetquiz.core_service.question.adapter.out.mapper.QuestionOptionMapper;
import ai.snippetquiz.core_service.question.domain.QuestionOption;
import ai.snippetquiz.core_service.question.domain.port.QuestionOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JpaQuestionOptionRepositoryAdapter implements QuestionOptionRepository {
    private final JpaQuestionOptionRepository jpaQuestionOptionRepository;
    private final QuestionOptionMapper questionOptionMapper;

    @Override
    public QuestionOption save(QuestionOption questionOption) {
        QuestionOptionEntity entity = questionOptionMapper.toEntity(questionOption);
        QuestionOptionEntity savedEntity = jpaQuestionOptionRepository.save(entity);
        return questionOptionMapper.toDomain(savedEntity);
    }
}