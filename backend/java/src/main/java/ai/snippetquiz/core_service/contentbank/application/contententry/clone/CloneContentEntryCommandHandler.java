package ai.snippetquiz.core_service.contentbank.application.contententry.clone;

import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CloneContentEntryCommandHandler implements CommandHandler<CloneContentEntryCommand> {
    private final ContentEntryService contentEntryService;

    @Override
    public void handle(CloneContentEntryCommand command) {
        contentEntryService.clone(
                new UserId(command.getUserId()),
                new ContentEntryId(command.getEntryId()),
                new ContentBankId(command.getTargetBankId())
        );
    }
}