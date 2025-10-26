package ai.snippetquiz.core_service.quiz.application.dto.request;

import jakarta.validation.constraints.NotNull;

public record CreateQuizRequest(
    @NotNull(message = "Bank ID cannot be null")
    String bankId,
    Long quizId
) {
}