package ai.snippetquiz.core_service.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ContentEntryDTOResponse(
    Long id,
    String contentType,
    String content, // truncated to 300 chars
    String sourceUrl,
    String pageTitle,
    LocalDateTime createdAt,
    Boolean questionsGenerated,
    List<String> topics
) {}