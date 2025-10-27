package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionResponseEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizQuestionResponseMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizQuestionResponseRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JpaQuizQuestionResponseRepositoryAdapter implements QuizQuestionResponseRepository {
    private final JpaQuizQuestionResponseRepository jpaQuizQuestionResponseRepository;
    private final QuizQuestionResponseMapper quizQuestionResponseMapper;

    @Override
    public QuizQuestionResponse save(QuizQuestionResponse quizQuestionResponse) {
        QuizQuestionResponseEntity entity = quizQuestionResponseMapper.toEntity(quizQuestionResponse);
        QuizQuestionResponseEntity savedEntity = jpaQuizQuestionResponseRepository.save(entity);
        return quizQuestionResponseMapper.toDomain(savedEntity);
    }

    @Override
    public Page<QuizQuestionResponse> findByQuiz_IdAndQuiz_UserId(QuizId quizId, UserId userId, Pageable pageable) {
        return jpaQuizQuestionResponseRepository.findByQuizIdAndUserId(quizId.getValue(), userId.getValue(), pageable)
                .map(quizQuestionResponseMapper::toDomain);
    }

    @Override
    public Integer countByQuizIdAndIsCorrect(QuizId quizId, Boolean isCorrect) {
        return jpaQuizQuestionResponseRepository.countByQuizIdAndIsCorrect(quizId.getValue(), isCorrect);
    }
}