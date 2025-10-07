package ai.snippetquiz.core_service.before.dto.response;

import java.util.List;

public record QuizSummaryResponseDto(
    List<String> topics,
    Integer totalQuestions,
    Integer totalCorrectAnswers
) {}