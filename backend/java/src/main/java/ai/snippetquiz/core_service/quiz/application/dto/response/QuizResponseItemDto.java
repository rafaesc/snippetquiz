package ai.snippetquiz.core_service.quiz.application.dto.response;

public record QuizResponseItemDto(
    Boolean isCorrect,
    String question,
    String answer,
    String correctAnswer,
    String explanation,
    String sourceUrl
) {}