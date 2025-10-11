package ai.snippetquiz.core_service.quiz.domain.port.repository;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;

public interface QuizQuestionOptionRepository {
    QuizQuestionOption save(QuizQuestionOption quizQuestionOption);
}