package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateContentEntryRequest(
    String sourceUrl,
    @NotBlank(message = "Content is required")
    @NotNull(message = "Content is required")
    String content,
    @NotBlank(message = "Type is required")
    @NotNull(message = "Content is required")
    String type,
    String pageTitle,
    @NotBlank(message = "Bank ID is required")
    String bankId,
    String youtubeVideoId,
    Integer youtubeVideoDuration,
    String youtubeChannelId,
    String youtubeChannelName,
    String youtubeAvatarUrl
) {}