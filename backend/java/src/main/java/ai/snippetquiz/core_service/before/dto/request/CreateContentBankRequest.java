package ai.snippetquiz.core_service.before.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateContentBankRequest(
    @NotNull(message = "Name is required")
    @NotBlank(message = "Name cannot be empty")
    String name
) {}