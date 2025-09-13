package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FindOneContentEntryRequest(
    @NotBlank(message = "ID is required")
    String id,
    @NotBlank(message = "User ID is required")
    String userId
) {}