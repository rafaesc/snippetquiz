package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizProjectionMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizProjectionRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JpaQuizProjectionProjectionRepositoryAdapter implements QuizProjectionRepository {
    private final JpaQuizProjectionRepository jpaQuizProjectionRepository;
    private final QuizProjectionMapper quizMapper;

    @Override
    public List<QuizProjection> findAllByUserIdAndStatus(UserId userId, QuizStatus status) {
        return jpaQuizProjectionRepository.findAllByUserIdAndStatus(userId.getValue(), status)
                .stream()
                .map(quizMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<QuizProjection> findByUserIdOrderByCreatedAtDesc(UserId userId, Pageable pageable) {
        return jpaQuizProjectionRepository.findByUserIdOrderByCreatedAtDesc(userId.getValue(), pageable)
                .map(quizMapper::toDomain);
    }
}