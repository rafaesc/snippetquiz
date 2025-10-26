package ai.snippetquiz.core_service.contentbank.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateContentEntryRequest(
    String sourceUrl,
    @NotBlank(message = "Content is required")
    @NotNull(message = "Content is required")
    String content,
    @NotBlank(message = "Type is required")
    @NotNull(message = "Content is required")
    String type,
    String pageTitle,
    @NotNull(message = "Bank ID is required")
    UUID bankId,
    String youtubeVideoId,
    Integer youtubeVideoDuration,
    String youtubeChannelId,
    String youtubeChannelName,
    String youtubeAvatarUrl
) {}