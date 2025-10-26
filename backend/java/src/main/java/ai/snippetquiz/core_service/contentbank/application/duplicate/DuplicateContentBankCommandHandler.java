package ai.snippetquiz.core_service.contentbank.application.duplicate;

import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DuplicateContentBankCommandHandler implements CommandHandler<DuplicateContentBankCommand> {
    private final ContentBankService contentBankService;

    @Override
    public void handle(DuplicateContentBankCommand command) {
        contentBankService.duplicate(
                new UserId(command.getUserId()),
                new ContentBankId(command.getId()),
                command.getName()
        );
    }
}
