package ai.snippetquiz.core_service.quiz.application.dto.response;

import java.util.UUID;

public record QuizInProgressDetails(
    Long quizId,
    UUID bankId,
    String name
) {}