package ai.snippetquiz.core_service.instruction.application.update;

import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.instruction.application.service.InstructionsService;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UpdateInstructionCommandHandler implements CommandHandler<UpdateInstructionCommand> {
    private final InstructionsService instructionsService;

    @Override
    public void handle(UpdateInstructionCommand command) {
        instructionsService.createOrUpdate(
                new UserId(command.getUserId()),
                command.getInstruction());
    }
}
