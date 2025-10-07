package ai.snippetquiz.core_service.before.dto.request;

public record QuestionOptionRequest(
    String optionText,
    String optionExplanation,
    Boolean isCorrect
) {}