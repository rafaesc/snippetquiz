package ai.snippetquiz.core_service.before.dto.response;

import java.time.LocalDateTime;

public record ContentBankItemResponse(
    Long id,
    String name,
    String userId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Integer contentEntries
) {}