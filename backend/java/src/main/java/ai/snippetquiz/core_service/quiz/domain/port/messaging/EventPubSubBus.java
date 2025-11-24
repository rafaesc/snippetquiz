package ai.snippetquiz.core_service.quiz.domain.port.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.AIQuestionGeneratedEvent;

public interface EventPubSubBus {
    void publish(AIQuestionGeneratedEvent event);
}
