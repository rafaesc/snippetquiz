package ai.snippetquiz.core_service.dto.request;

public record QuestionOptionRequest(
    String optionText,
    String optionExplanation,
    Boolean isCorrect
) {}