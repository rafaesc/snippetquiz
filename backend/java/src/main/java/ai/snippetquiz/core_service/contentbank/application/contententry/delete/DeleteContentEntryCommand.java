package ai.snippetquiz.core_service.contentbank.application.contententry.delete;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class DeleteContentEntryCommand implements Command {
    private final UUID userId;
    private final UUID entryId;
}