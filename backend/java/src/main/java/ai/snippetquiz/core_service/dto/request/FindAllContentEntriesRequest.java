package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record FindAllContentEntriesRequest(
    @Min(value = 1, message = "Page must be non-negative")
    Integer page,
    @Min(value = 1, message = "Limit must be positive")
    Integer limit,
    String name,
    @NotBlank(message = "Bank ID is required")
    String bankId
) {}