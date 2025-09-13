package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record PaginatedContentBanksResponse(
    List<ContentBankItemResponse> contentBanks,
    PaginationInfo pagination
) {}