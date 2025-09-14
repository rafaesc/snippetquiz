package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record PaginatedQuizResponsesDto(
    List<QuizResponseItemDto> responses,
    PaginationInfo pagination
) {}