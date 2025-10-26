package ai.snippetquiz.core_service.quiz.domain.port.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.CreateQuizGenerationEventPayload;

import java.util.UUID;

public interface CreateQuizEventPublisher {
    void emitCreateQuizEvent(
            CreateQuizGenerationEventPayload payload, String userId, Long quizId, UUID bankId, Integer entriesSkipped);
}
