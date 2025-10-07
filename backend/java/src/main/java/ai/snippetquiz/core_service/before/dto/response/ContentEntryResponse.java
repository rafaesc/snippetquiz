package ai.snippetquiz.core_service.before.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ContentEntryResponse(
    Long id,
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