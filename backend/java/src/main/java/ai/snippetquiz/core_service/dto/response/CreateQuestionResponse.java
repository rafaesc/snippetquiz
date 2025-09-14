package ai.snippetquiz.core_service.dto.response;

public record CreateQuestionResponse(
    String message,
    Long questionId
) {}