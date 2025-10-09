package ai.snippetquiz.core_service.contentbank.domain.events;

import java.util.List;

public record ContentEntryEventPayload(
    String userId,
    Long contentId,
    String action,
    String content,
    String pageTitle,
    String existingTopics,
    List<String> topics
) {}