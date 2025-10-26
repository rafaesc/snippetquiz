package ai.snippetquiz.core_service.contentbank.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DuplicateContentBankRequest(
        @NotBlank(message = "Name is required") String name) {
}