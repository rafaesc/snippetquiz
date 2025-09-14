package ai.snippetquiz.core_service.dto.response;

public record QuizQuestionOptionDTOResponse(
    String id,
    String optionText,
    String optionExplanation,
    Boolean isCorrect
) {}
