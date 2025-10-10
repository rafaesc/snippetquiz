package ai.snippetquiz.core_service.quiz.application.dto.response;

public record QuizInProgressDetails(
    Long quizId,
    Long bankId,
    String name
) {}