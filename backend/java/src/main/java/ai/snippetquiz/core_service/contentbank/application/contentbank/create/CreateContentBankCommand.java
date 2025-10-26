package ai.snippetquiz.core_service.contentbank.application.contentbank.create;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class CreateContentBankCommand implements Command {
    private final UUID id;
    private final String name;
    private final UUID userId;
}
