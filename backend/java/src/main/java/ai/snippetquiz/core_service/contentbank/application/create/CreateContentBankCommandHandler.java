package ai.snippetquiz.core_service.contentbank.application.create;

import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CreateContentBankCommandHandler implements CommandHandler<CreateContentBankCommand> {
    private final ContentBankService contentBankService;

    @Override
    public void handle(CreateContentBankCommand command) {
        contentBankService.create(
                new ContentBankId(command.getId()),
                new UserId(command.getUserId()),
                command.getName());
    }
}
