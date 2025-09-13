package ai.snippetquiz.core_service.dto.response;

public record CalculateTotalChunksResponse(
    Integer totalChunks,
    Integer chunkSize,
    String bankId
) {}