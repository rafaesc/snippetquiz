package ai.snippetquiz.core_service.dto.response;

public record EmitCreateQuizEventResponse(
    String message,
    Integer entriesSkipped
) {}