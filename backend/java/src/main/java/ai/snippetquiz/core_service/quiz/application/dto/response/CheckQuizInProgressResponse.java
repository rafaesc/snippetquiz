package ai.snippetquiz.core_service.quiz.application.dto.response;

public record CheckQuizInProgressResponse(
    Boolean inProgress,
    QuizInProgressDetails details
) {}