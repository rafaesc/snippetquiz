package ai.snippetquiz.core_service.dto.response;

public record CheckQuizInProgressResponse(
    Boolean inProgress,
    QuizInProgressDetails details
) {}