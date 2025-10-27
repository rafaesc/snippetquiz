package ai.snippetquiz.core_service.quiz.domain.port.messaging;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.events.CreateQuizGenerationEventPayload;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

public interface CreateQuizEventPublisher {
    void emitCreateQuizEvent(
            CreateQuizGenerationEventPayload payload, UserId userId, QuizId quizId, ContentBankId bankId, Integer entriesSkipped);
}
