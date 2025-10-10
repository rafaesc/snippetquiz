package ai.snippetquiz.core_service.question.application;

import ai.snippetquiz.core_service.question.application.dto.CreateQuestionRequest;

import java.util.UUID;

public interface QuestionService {
    void createQuestion(CreateQuestionRequest request, UUID userId);
}
