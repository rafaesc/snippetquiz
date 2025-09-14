package ai.snippetquiz.core_service.dto.response;

public record QuizResponseItemDto(
    Boolean isCorrect,
    String question,
    String answer,
    String correctAnswer,
    String explanation,
    String sourceUrl
) {}