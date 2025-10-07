package ai.snippetquiz.core_service.before.dto.response;

public record QuizInProgressDetails(
    Long quizId,
    Long bankId,
    String name
) {}