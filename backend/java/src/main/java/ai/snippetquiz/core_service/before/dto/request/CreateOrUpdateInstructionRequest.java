package ai.snippetquiz.core_service.before.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateOrUpdateInstructionRequest(
    @NotBlank(message = "Instruction cannot be blank")
    String instruction
) {
}