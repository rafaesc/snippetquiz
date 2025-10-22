package ai.snippetquiz.core_service.instruction.application.update;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UpdateInstructionCommand implements Command {
    private final UUID userId;
    private final String instruction;
}