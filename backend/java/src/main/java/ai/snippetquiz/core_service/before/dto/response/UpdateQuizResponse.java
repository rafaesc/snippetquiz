package ai.snippetquiz.core_service.before.dto.response;

public record UpdateQuizResponse(
    String message,
    Boolean success,
    Boolean completed,
    Long correctOptionId
) {}