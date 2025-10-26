package ai.snippetquiz.core_service.contentbank.application;

import java.time.LocalDateTime;
import java.util.List;

public record ContentEntryResponse(
    String id,
    String contentType,
    String content,
    String sourceUrl,
    String pageTitle,
    LocalDateTime createdAt,
    Boolean questionsGenerated,
    String promptSummary,
    List<String> topics,
    Integer entryCount
) {}