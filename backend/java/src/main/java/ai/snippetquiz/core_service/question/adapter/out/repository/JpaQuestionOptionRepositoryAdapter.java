package ai.snippetquiz.core_service.question.adapter.out.repository;

import ai.snippetquiz.core_service.question.adapter.out.mapper.QuestionOptionMapper;
import ai.snippetquiz.core_service.question.domain.QuestionOption;
import ai.snippetquiz.core_service.question.domain.port.QuestionOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JpaQuestionOptionRepositoryAdapter implements QuestionOptionRepository {
    private final JpaQuestionOptionRepository jpaQuestionOptionRepository;
    private final QuestionOptionMapper questionOptionMapper;

    @Override
    public List<QuestionOption> saveAll(List<QuestionOption> questionOptions) {
        var entities = questionOptionMapper.toEntity(questionOptions);
        var savedEntities = jpaQuestionOptionRepository.saveAll(entities);

        return savedEntities.stream().map(questionOptionMapper::toDomain).toList();
    }
}