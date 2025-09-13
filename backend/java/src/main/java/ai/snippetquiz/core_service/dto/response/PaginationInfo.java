package ai.snippetquiz.core_service.dto.response;

public record PaginationInfo(
    Integer page,
    Integer limit,
    Long total
) {}