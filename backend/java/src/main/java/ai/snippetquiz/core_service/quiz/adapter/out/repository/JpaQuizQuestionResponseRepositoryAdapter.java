package ai.snippetquiz.core_service.quiz.adapter.out.repository;

import ai.snippetquiz.core_service.quiz.adapter.out.entities.QuizQuestionResponseEntity;
import ai.snippetquiz.core_service.quiz.adapter.out.mapper.QuizQuestionResponseMapper;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.port.QuizQuestionResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.UUID;

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
    public Page<QuizQuestionResponse> findByQuiz_IdAndQuiz_UserId(Long quizId, UUID userId, Pageable pageable) {
        return jpaQuizQuestionResponseRepository.findByQuiz_IdAndQuiz_UserId(quizId, userId, pageable)
                .map(quizQuestionResponseMapper::toDomain);
    }

    @Override
    public Integer countByQuizIdAndIsCorrect(Long quizId, Boolean isCorrect) {
        return jpaQuizQuestionResponseRepository.countByQuizIdAndIsCorrect(quizId, isCorrect);
    }
}