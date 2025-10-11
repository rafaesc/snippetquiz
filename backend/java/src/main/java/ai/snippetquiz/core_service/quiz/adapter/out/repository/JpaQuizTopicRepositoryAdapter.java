package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizTopicEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizTopicMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizTopic;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizTopicRepository;
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
    public List<QuizTopic> findByQuizId(Long quizId) {
        return jpaQuizTopicRepository.findByQuizId(quizId)
                .stream()
                .map(quizTopicMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByQuizId(Long quizId) {
        jpaQuizTopicRepository.deleteByQuizId(quizId);
    }

    @Override
    public Optional<QuizTopic> findByQuizIdAndTopicName(Long quizId, String topicName) {
        return jpaQuizTopicRepository.findByQuizIdAndTopicName(quizId, topicName)
                .map(quizTopicMapper::toDomain);
    }
}