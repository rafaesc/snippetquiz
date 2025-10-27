package ai.snippetquiz.core_service.quiz.adapter.in.web.request;

import java.util.UUID;

public record CreateQuizDTO(
        UUID bankId,
        Long quizId) {
}