package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record QuizSummaryResponseDto(
    List<String> topics,
    Integer totalQuestions,
    Integer totalCorrectAnswers
) {}