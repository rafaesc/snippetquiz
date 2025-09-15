package ai.snippetquiz.core_service.dto.request;

import ai.snippetquiz.core_service.entity.QuizStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateQuizRequest(
    @NotNull(message = "Bank ID cannot be null")
    @Positive(message = "Bank ID must be positive")
    Integer bankId,
    String quizId,
    @NotNull(message = "Status cannot be null")
    QuizStatus status
) {
}