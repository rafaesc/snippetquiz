package ai.snippetquiz.core_service.contentbank.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ContentBankResponse(
    UUID id,
    String name,
    String userId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Integer entryCount
) {}