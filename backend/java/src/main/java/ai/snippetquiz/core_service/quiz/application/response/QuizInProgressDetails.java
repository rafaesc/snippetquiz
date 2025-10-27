package ai.snippetquiz.core_service.quiz.application.response;

public record QuizInProgressDetails(
    String quizId,
    String bankId,
    String name
) {}