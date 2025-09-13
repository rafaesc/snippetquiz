package ai.snippetquiz.core_service.dto.response;

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