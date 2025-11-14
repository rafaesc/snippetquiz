package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizProjectionMapper;
import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizProjectionEntity;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizProjectionRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
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

    @Override
    public void deleteById(QuizId quizId) {
        jpaQuizProjectionRepository.deleteById(quizId.getValue());
    }

    @Override
    public QuizProjection findById(QuizId quizId) {
        return jpaQuizProjectionRepository.findById(quizId.getValue()).map(quizMapper::toDomain).orElse(null);
    }

    @Override
    public void upsert(QuizProjection quizProjection) {
        UUID id = quizProjection.getId().getValue();
        QuizProjectionEntity entity = jpaQuizProjectionRepository.findById(id)
                .orElseGet(() -> {
                    var e = new QuizProjectionEntity();
                    e.setId(id);
                    return e;
                });

        if (quizProjection.getUserId() != null) {
            entity.setUserId(quizProjection.getUserId().getValue());
        }
        if (quizProjection.getContentBankId() != null) {
            entity.setContentBankId(quizProjection.getContentBankId().getValue());
        }
        if (quizProjection.getBankName() != null) {
            entity.setBankName(quizProjection.getBankName());
        }
        if (quizProjection.getStatus() != null) {
            entity.setStatus(quizProjection.getStatus());
        }
        if (quizProjection.getCreatedAt() != null) {
            entity.setCreatedAt(quizProjection.getCreatedAt());
        }
        if (quizProjection.getContentEntriesCount() != null) {
            entity.setContentEntriesCount(quizProjection.getContentEntriesCount());
        }
        if (quizProjection.getQuestionsCount() != null) {
            entity.setQuestionsCount(quizProjection.getQuestionsCount());
        }
        if (quizProjection.getQuestionsCompleted() != null) {
            entity.setQuestionsCompleted(quizProjection.getQuestionsCompleted());
        }
        if (quizProjection.getQuestionUpdatedAt() != null) {
            entity.setQuestionUpdatedAt(quizProjection.getQuestionUpdatedAt());
        }
        if (quizProjection.getTopics() != null) {
            entity.setTopics(quizProjection.getTopics());
        }
        if (quizProjection.getQuestions() != null) {
            entity.setQuestions(quizProjection.getQuestions());
        }
        if (quizProjection.getResponses() != null) {
            entity.setResponses(quizProjection.getResponses());
        }

        jpaQuizProjectionRepository.save(entity);
    }
}