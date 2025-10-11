package ai.snippetquiz.core_service.quiz.domain.port.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.QuizGenerationEventPayload;

public interface SendFanoutMessageQuizLoadingEvent {
    void sendFanoutMessageQuizGenerationEvent(String userId, QuizGenerationEventPayload event);
}
