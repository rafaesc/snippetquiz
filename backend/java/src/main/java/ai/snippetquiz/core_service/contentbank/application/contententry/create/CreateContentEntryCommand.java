package ai.snippetquiz.core_service.contentbank.application.contententry.create;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class CreateContentEntryCommand implements Command {
    private final UUID userId;
    private final String sourceUrl;
    private final String content;
    private final String type;
    private final String pageTitle;
    private final UUID bankId;
    private final String youtubeVideoId;
    private final Integer youtubeVideoDuration;
    private final String youtubeChannelId;
    private final String youtubeChannelName;
    private final String youtubeAvatarUrl;
}