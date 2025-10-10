package ai.snippetquiz.core_service.question.domain.port;


import ai.snippetquiz.core_service.question.domain.QuestionOption;

public interface QuestionOptionRepository {
    QuestionOption save(QuestionOption questionOption);
}