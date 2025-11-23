package ai.snippetquiz.core_service.quiz.domain.port.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.QuizGenerationEventPayload;

public interface EventPubSubBus {
    void publish(String userId, QuizGenerationEventPayload event);
}
