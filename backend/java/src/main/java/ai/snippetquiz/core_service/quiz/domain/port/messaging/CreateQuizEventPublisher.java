package ai.snippetquiz.core_service.quiz.domain.port.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.CreateQuizGenerationEventPayload;

public interface CreateQuizEventPublisher {
    void emitCreateQuizEvent(
            CreateQuizGenerationEventPayload payload, String userId, Long quizId, Long bankId, Integer entriesSkipped);
}
