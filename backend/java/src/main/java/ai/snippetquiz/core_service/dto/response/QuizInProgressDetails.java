package ai.snippetquiz.core_service.dto.response;

public record QuizInProgressDetails(
    Long quizId,
    Long bankId,
    String name
) {}