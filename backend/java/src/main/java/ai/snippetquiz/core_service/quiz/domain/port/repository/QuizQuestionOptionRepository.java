package ai.snippetquiz.core_service.quiz.domain.port.repository;

import java.util.List;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;

public interface QuizQuestionOptionRepository {
    QuizQuestionOption save(QuizQuestionOption quizQuestionOption);
    List<QuizQuestionOption> findByQuizQuestionId(Long quizQuestionId);
}