package ai.snippetquiz.core_service.quiz.application.dto.response;

public record UpdateQuizResponse(
    String message,
    Boolean success,
    Boolean completed,
    Long correctOptionId
) {}