package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateQuizRequest(
    @NotNull(message = "Bank ID cannot be null")
    @Positive(message = "Bank ID must be positive")
    Long bankId,
    String quizId
) {
}