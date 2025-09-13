package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RemoveContentEntryRequest(
    @NotBlank(message = "ID is required")
    String id
) {}