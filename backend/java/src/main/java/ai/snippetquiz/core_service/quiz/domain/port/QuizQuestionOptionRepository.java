package ai.snippetquiz.core_service.quiz.domain.port;

import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;

public interface QuizQuestionOptionRepository {
    QuizQuestionOption save(QuizQuestionOption quizQuestionOption);
}