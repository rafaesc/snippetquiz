package ai.snippetquiz.core_service.contentbank.application.delete;

import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DeleteContentBankCommandHandler implements CommandHandler<DeleteContentBankCommand> {
    private final ContentBankService contentBankService;

    public void handle(DeleteContentBankCommand command) {
        contentBankService.remove(
                new UserId(command.getUserId()),
                new ContentBankId(command.getId())
        );
    }
}
