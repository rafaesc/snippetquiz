package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CloneContentEntryRequest(
    @NotBlank(message = "Target bank ID is required")
    String targetBankId
) {}