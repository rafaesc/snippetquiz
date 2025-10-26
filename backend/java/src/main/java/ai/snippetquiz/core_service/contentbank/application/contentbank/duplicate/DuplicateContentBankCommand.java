package ai.snippetquiz.core_service.contentbank.application.contentbank.duplicate;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class DuplicateContentBankCommand implements Command {
    private final String name;
    private final UUID id;
    private final UUID userId;
}
