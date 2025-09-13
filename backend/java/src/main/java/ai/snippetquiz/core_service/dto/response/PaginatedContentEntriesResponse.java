package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record PaginatedContentEntriesResponse(
    List<ContentEntryResponse> entries,
    PaginationInfo pagination
) {}