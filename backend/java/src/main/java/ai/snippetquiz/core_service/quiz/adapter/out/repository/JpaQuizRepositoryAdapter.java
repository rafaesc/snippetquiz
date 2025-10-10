package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizMapper;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaQuizRepositoryAdapter implements QuizRepository {
    private final JpaQuizRepository jpaQuizRepository;
    private final QuizMapper quizMapper;

    @Override
    public Quiz save(Quiz quiz) {
        QuizEntity entity = quizMapper.toEntity(quiz);
        QuizEntity savedEntity = jpaQuizRepository.save(entity);
        return quizMapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Quiz quiz) {
        jpaQuizRepository.delete(quizMapper.toEntity(quiz));
    }

    @Override
    public Optional<Quiz> findById(Long id) {
        return jpaQuizRepository.findById(id)
                .map(quizMapper::toDomain);
    }

    @Override
    public List<Quiz> findAllByUserIdAndStatus(UUID userId, QuizStatus status) {
        return jpaQuizRepository.findAllByUserIdAndStatus(userId, status)
                .stream()
                .map(quizMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Quiz> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable) {
        return jpaQuizRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(quizMapper::toDomain);
    }

    @Override
    public Optional<Quiz> findByIdAndUserIdWithTopics(Long id, UUID userId) {
        return jpaQuizRepository.findByIdAndUserIdWithTopics(id, userId)
                .map(quizMapper::toDomain);
    }

    @Override
    public Optional<Quiz> findByIdAndUserIdWithQuestions(Long id, UUID userId) {
        return jpaQuizRepository.findByIdAndUserIdWithQuestions(id, userId)
                .map(quizMapper::toDomain);
    }

    @Override
    public Optional<Quiz> findByIdAndUserId(Long id, UUID userId) {
        return jpaQuizRepository.findByIdAndUserId(id, userId)
                .map(quizMapper::toDomain);
    }
}