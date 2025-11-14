package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriberFor;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@AggregateEventSubscriberFor(Quiz.class)
public class TestQuizEventsSubscriber implements AggregateEventSubscriber {

    private static volatile DomainEvent lastEvent;
    private static CountDownLatch latch = new CountDownLatch(1);

    public static void reset() {
        lastEvent = null;
        latch = new CountDownLatch(1);
    }

    public static boolean await(long timeout, TimeUnit unit) throws InterruptedException {
        return latch.await(timeout, unit);
    }

    public static DomainEvent lastEvent() {
        return lastEvent;
    }

    @Override
    public void on(DomainEvent event) {
        lastEvent = event;
        latch.countDown();
    }
}