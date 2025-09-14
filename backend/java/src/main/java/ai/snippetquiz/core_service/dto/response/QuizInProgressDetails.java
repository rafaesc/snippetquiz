package ai.snippetquiz.core_service.dto.response;

public record QuizInProgressDetails(
    String quizId,
    String bankId,
    String name
) {}