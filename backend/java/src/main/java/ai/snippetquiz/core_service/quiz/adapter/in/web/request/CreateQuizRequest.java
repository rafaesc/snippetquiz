package ai.snippetquiz.core_service.quiz.adapter.in.web.request;

import jakarta.validation.constraints.NotNull;

public record CreateQuizRequest(
    @NotNull(message = "Bank ID cannot be null")
    String bankId,
    String quizId
) {
}