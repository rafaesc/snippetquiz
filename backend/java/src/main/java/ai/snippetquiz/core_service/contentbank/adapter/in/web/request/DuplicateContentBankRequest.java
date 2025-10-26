package ai.snippetquiz.core_service.contentbank.adapter.in.web.request;

import jakarta.validation.constraints.NotBlank;

public record DuplicateContentBankRequest(
        @NotBlank(message = "Name is required") String name) {
}