package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizMapper;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Slf4j
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
    public Optional<Quiz> findById(QuizId id) {
        return jpaQuizRepository.findById(id.getValue())
                .map(quizMapper::toDomain);
    }

    @Override
    public List<Quiz> findAllByUserIdAndStatus(UserId userId, QuizStatus status) {
        return jpaQuizRepository.findAllByUserIdAndStatus(userId.getValue(), status)
                .stream()
                .map(quizMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Quiz> findByUserIdOrderByCreatedAtDesc(UserId userId, Pageable pageable) {
        long startTime = System.currentTimeMillis();
        Page<Quiz> result = jpaQuizRepository.findByUserIdOrderByCreatedAtDesc(userId.getValue(), pageable)
                .map(quizMapper::toDomain);
        long endTime = System.currentTimeMillis();
        log.info("Repository findByUserIdOrderByCreatedAtDesc execution time: {} ms", endTime - startTime);
        return result;
    }

    @Override
    public Optional<Quiz> findByIdAndUserIdWithTopics(QuizId id, UserId userId) {
        return jpaQuizRepository.findByIdAndUserIdWithTopics(id.getValue(), userId.getValue())
                .map(quizMapper::toDomain);
    }

    @Override
    public Optional<Quiz> findByIdAndUserIdWithQuestions(QuizId id, UserId userId) {
        return jpaQuizRepository.findByIdAndUserIdWithQuestions(id.getValue(), userId.getValue())
                .map(quizMapper::toDomain);
    }

    @Override
    public Optional<Quiz> findByIdAndUserId(QuizId id, UserId userId) {
        return jpaQuizRepository.findByIdAndUserId(id.getValue(), userId.getValue())
                .map(quizMapper::toDomain);
    }
}