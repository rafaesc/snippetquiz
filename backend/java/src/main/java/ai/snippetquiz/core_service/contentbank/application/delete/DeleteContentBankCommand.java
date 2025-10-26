package ai.snippetquiz.core_service.contentbank.application.delete;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class DeleteContentBankCommand implements Command {
        private final UUID id;
        private final UUID userId;
}
