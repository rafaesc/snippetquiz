package ai.snippetquiz.core_service.contentbank.application.dto.response;

import java.time.LocalDateTime;

public record ContentBankResponse(
    Long id,
    String name,
    String userId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Integer entryCount
) {}