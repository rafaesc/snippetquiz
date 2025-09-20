package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotNull;

public record CreateQuizRequest(
    @NotNull(message = "Bank ID cannot be null")
    Long bankId,
    String quizId
) {
}