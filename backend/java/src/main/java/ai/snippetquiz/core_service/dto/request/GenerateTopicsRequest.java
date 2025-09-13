package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record GenerateTopicsRequest(
    @NotBlank(message = "Content entry ID is required")
    String contentEntryId
) {}