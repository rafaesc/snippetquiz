package ai.snippetquiz.core_service.quiz.application.consumer;

import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriberFor;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;

@AggregateEventSubscriberFor(Quiz.class)
public class QuizProjectionHandler implements AggregateEventSubscriber {
    @Override
    public void on(DomainEvent event) { }
}