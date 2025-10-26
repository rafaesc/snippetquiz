package ai.snippetquiz.core_service.contentbank.application.contententry.create;

import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CreateContentEntryCommandHandler implements CommandHandler<CreateContentEntryCommand> {
    private final ContentEntryService contentEntryService;

    @Override
    public void handle(CreateContentEntryCommand command) {
        contentEntryService.create(new UserId(command.getUserId()),
                command.getSourceUrl(),
                command.getContent(),
                command.getType(),
                command.getPageTitle(),
                new ContentBankId(command.getBankId()),
                command.getYoutubeVideoId(),
                command.getYoutubeVideoDuration(),
                command.getYoutubeChannelId(),
                command.getYoutubeChannelName(),
                command.getYoutubeAvatarUrl());
    }
}