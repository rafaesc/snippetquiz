package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record PaginatedResponse<T>(
    List<T> data,
    PaginationInfo pagination
) {}