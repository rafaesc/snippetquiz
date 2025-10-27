package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizTopicEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizTopicMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizTopicRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaQuizTopicRepositoryAdapter implements QuizTopicRepository {
    private final JpaQuizTopicRepository jpaQuizTopicRepository;
    private final QuizTopicMapper quizTopicMapper;

    @Override
    public QuizTopic save(QuizTopic quizTopic) {
        QuizTopicEntity entity = quizTopicMapper.toEntity(quizTopic);
        QuizTopicEntity savedEntity = jpaQuizTopicRepository.save(entity);
        return quizTopicMapper.toDomain(savedEntity);
    }

    @Override
    public List<QuizTopic> findByQuizId(QuizId quizId) {
        return jpaQuizTopicRepository.findByQuizId(quizId.getValue())
                .stream()
                .map(quizTopicMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByQuizId(QuizId quizId) {
        jpaQuizTopicRepository.deleteByQuizId(quizId.getValue());
    }

    @Override
    public Optional<QuizTopic> findByQuizIdAndTopicName(QuizId quizId, String topicName) {
        return jpaQuizTopicRepository.findByQuizIdAndTopicName(quizId.getValue(), topicName)
                .map(quizTopicMapper::toDomain);
    }
}