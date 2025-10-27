package ai.snippetquiz.core_service.question.adapter.out.repository;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.adapter.out.entities.QuestionEntity;
import ai.snippetquiz.core_service.question.adapter.out.mapper.QuestionMapper;
import ai.snippetquiz.core_service.question.adapter.out.mapper.QuestionOptionMapper;
import ai.snippetquiz.core_service.question.domain.Question;
import ai.snippetquiz.core_service.question.domain.port.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaQuestionRepositoryAdapter implements QuestionRepository {
    private final JpaQuestionRepository jpaQuestionRepository;
    private final QuestionMapper questionMapper;
    private final QuestionOptionMapper questionOptionMapper;

    @Override
    public Question save(Question question) {
        QuestionEntity entity = questionOptionMapper.toEntity(question);
        QuestionEntity savedEntity = jpaQuestionRepository.save(entity);
        return questionMapper.toDomain(savedEntity);
    }

    @Override
    public List<Question> findByContentEntryId(ContentEntryId contentEntryId) {
        return jpaQuestionRepository.findByContentEntryId(contentEntryId.getValue())
                .stream()
                .map(questionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Question> findByContentEntryIdIn(List<ContentEntryId> contentEntryIds) {
        return jpaQuestionRepository.findByContentEntryIdIn(contentEntryIds.stream().map(ContentEntryId::getValue).toList())
                .stream()
                .map(questionMapper::toDomain)
                .collect(Collectors.toList());
    }
}