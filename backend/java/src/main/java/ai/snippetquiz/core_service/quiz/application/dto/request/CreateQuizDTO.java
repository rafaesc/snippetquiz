package ai.snippetquiz.core_service.quiz.application.dto.request;

import java.util.UUID;

public record CreateQuizDTO(
        UUID bankId,
        Long quizId) {
}