package ai.snippetquiz.core_service.before.dto.response;

public record CheckQuizInProgressResponse(
    Boolean inProgress,
    QuizInProgressDetails details
) {}