package ai.snippetquiz.core_service.quiz.application.dto.response;

import java.util.List;

public record QuizSummaryResponseDto(
    List<String> topics,
    Integer totalQuestions,
    Integer totalCorrectAnswers
) {}