package ai.snippetquiz.core_service.dto.response;

public record UpdateQuizResponse(
    String message,
    Boolean success,
    Boolean completed
) {}