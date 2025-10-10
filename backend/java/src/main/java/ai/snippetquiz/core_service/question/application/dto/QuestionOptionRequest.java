package ai.snippetquiz.core_service.question.application.dto;

public record QuestionOptionRequest(
    String optionText,
    String optionExplanation,
    Boolean isCorrect
) {}