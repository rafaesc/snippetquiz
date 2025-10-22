package ai.snippetquiz.core_service.instruction.adapter.in.request;

import jakarta.validation.constraints.NotBlank;

public record CreateOrUpdateInstructionRequest(
    @NotBlank(message = "Instruction cannot be blank")
    String instruction
) {
}