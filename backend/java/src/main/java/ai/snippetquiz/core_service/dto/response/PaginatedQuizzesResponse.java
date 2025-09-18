package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record PaginatedQuizzesResponse(
    List<QuizResponse> quizzes,
    PaginationInfo pagination
) {}