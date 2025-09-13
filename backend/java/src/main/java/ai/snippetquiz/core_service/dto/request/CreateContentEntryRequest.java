package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateContentEntryRequest(
    String sourceUrl,
    @NotBlank(message = "Content is required")
    String content,
    @NotBlank(message = "Type is required")
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