package ai.snippetquiz.core_service.dto.request;

import ai.snippetquiz.core_service.entity.QuizStatus;

public record CreateQuizDTO(
    Long bankId,
    String quizId,
    QuizStatus status
) {
}