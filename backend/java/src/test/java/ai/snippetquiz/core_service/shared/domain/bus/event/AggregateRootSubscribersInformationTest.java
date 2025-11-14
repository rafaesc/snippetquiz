package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.quiz.application.consumer.QuizProjectionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.GenericApplicationContext;

import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AggregateRootSubscribersInformationTest {

    @Test
    void search_returns_registered_bean_instances_for_aggregate_type() {
        GenericApplicationContext ctx = new GenericApplicationContext();
        ctx.registerBean(QuizProjectionHandler.class);
        ctx.refresh();

        // Prepare info and inject context
        AggregateRootSubscribersInformation info = new AggregateRootSubscribersInformation(ctx);

        // Act
        List<AggregateEventSubscriber> subscribers = info.search("quiz-aggregate");

        // Assert
        assertNotNull(subscribers);
        assertFalse(subscribers.isEmpty(), "Expected at least one subscriber for quiz-aggregate");
        assertTrue(subscribers.stream().anyMatch(s -> s instanceof QuizProjectionHandler),
                "Expected an instance of QuizProjectionHandler among search results");
        assertTrue(subscribers.stream().allMatch(s -> s instanceof AggregateEventSubscriber),
                "All results must implement AggregateEventSubscriber");
    }

    @Test
    void search_returns_empty_list_for_unknown_aggregate_type() {
        GenericApplicationContext ctx = new GenericApplicationContext();
        ctx.refresh();

        AggregateRootSubscribersInformation info = new AggregateRootSubscribersInformation(ctx);

        List<AggregateEventSubscriber> subscribers = info.search("unknown-aggregate");

        assertNotNull(subscribers);
        assertTrue(subscribers.isEmpty(), "Expected empty result for unknown aggregate type");
    }

    @Test
    void getSubscribers_returns_map_with_quiz_key_and_handler_instance() {
        GenericApplicationContext ctx = new GenericApplicationContext();
        ctx.registerBean(QuizProjectionHandler.class);
        ctx.refresh();

        AggregateRootSubscribersInformation info = new AggregateRootSubscribersInformation(ctx);

        var subscribers = info.getSubscribers();

        assertNotNull(subscribers, "getSubscribers should not return null");
        assertFalse(subscribers.isEmpty(), "Subscribers map should not be empty");
        assertTrue(subscribers.containsKey("quiz-aggregate"), "Map should contain 'quiz-aggregate' key");

        List<AggregateEventSubscriber> quizSubscribers = subscribers.get("quiz-aggregate");
        assertNotNull(quizSubscribers, "List for 'quiz-aggregate' should not be null");
        assertFalse(quizSubscribers.isEmpty(), "List for 'quiz-aggregate' should not be empty");
        assertTrue(quizSubscribers.stream().anyMatch(s -> s instanceof QuizProjectionHandler),
                "Expected an instance of QuizProjectionHandler among quiz subscribers");
        assertTrue(quizSubscribers.stream().allMatch(s -> s instanceof AggregateEventSubscriber),
                "All subscribers must implement AggregateEventSubscriber");

        assertThrows(UnsupportedOperationException.class, () -> subscribers.put("other", java.util.List.of()),
                "Subscribers map should be unmodifiable");
    }
}