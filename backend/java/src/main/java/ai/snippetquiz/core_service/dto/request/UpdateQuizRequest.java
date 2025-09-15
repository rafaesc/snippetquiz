package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateQuizRequest(
    
    @NotNull(message = "Question option ID cannot be null")
    @Positive(message = "Question option ID must be positive")
    Long questionOptionId
) {
}