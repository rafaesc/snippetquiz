package ai.snippetquiz.core_service.dto.event;

import java.util.List;

public record ContentEntryEventPayload(
    String userId,
    String contentId,
    String action,
    String content,
    String pageTitle,
    String existingTopics,
    List<String> topics
) {}