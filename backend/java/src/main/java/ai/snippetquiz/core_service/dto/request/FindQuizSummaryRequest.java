package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FindQuizSummaryRequest(
    @NotNull(message = "ID cannot be null")
    @Positive(message = "ID must be positive")
    Integer id
) {
}