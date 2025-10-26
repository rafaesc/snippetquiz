package ai.snippetquiz.core_service.contentbank.application.contententry.delete;

import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DeleteContentEntryCommandHandler implements CommandHandler<DeleteContentEntryCommand> {
    private final ContentEntryService contentEntryService;

    @Override
    public void handle(DeleteContentEntryCommand command) {
        contentEntryService.remove(
                new UserId(command.getUserId()),
                new ContentEntryId(command.getEntryId())
        );
    }
}