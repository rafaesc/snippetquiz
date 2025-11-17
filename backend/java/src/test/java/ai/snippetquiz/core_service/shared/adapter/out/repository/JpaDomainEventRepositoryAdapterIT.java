package ai.snippetquiz.core_service.shared.adapter.out.repository;

import ai.snippetquiz.AbstractIntegrationTest;
import ai.snippetquiz.core_service.quiz.domain.events.QuizAnswerMarkedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import ai.snippetquiz.core_service.shared.adapter.out.entities.DomainEventEntity;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class JpaDomainEventRepositoryAdapterIT extends AbstractIntegrationTest {

    @Autowired
    private JpaDomainEventRepositoryAdapter<DomainEvent> adapter;

    @Autowired
    private JpaDomainEventRepository jpaRepository;

    @Test
    void saveAndFind_returnsDeserializedEvent() {
        var userId = UserId.map(UUID.randomUUID().toString());
        var aggregateId = UUID.randomUUID().toString();

        var response = new QuizQuestionResponse(
                QuizQuestionId.map(UUID.randomUUID().toString()),
                QuizQuestionOptionId.map(UUID.randomUUID().toString()),
                true,
                "Correct",
                "PT5S");

        var created = new QuizAnswerMarkedDomainEvent(
                aggregateId,
                userId,
                response,
                false);

        adapter.save(userId, aggregateId, "quiz", created);

        List<DomainEvent> events = adapter.findAllByUserIdAndAggregateIdAndAggregateType(userId, aggregateId);
        assertFalse(events.isEmpty());
        var event = events.getFirst();
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, event);
        var deserialized = (QuizAnswerMarkedDomainEvent) event;
        assertEquals(aggregateId, deserialized.getAggregateId());
        assertEquals(userId.toString(), deserialized.getUserId());
        assertFalse(deserialized.isAllQuestionsMarked());
        assertEquals("Correct", deserialized.getQuizQuestionResponse().getCorrectAnswer());
    }

    @Test
    void find_filtersByUserAndAggregate() {
        var userId = UserId.map(UUID.randomUUID().toString());
        var aggregateId = UUID.randomUUID().toString();
        var otherUser = UserId.map(UUID.randomUUID().toString());
        var otherAggregate = UUID.randomUUID().toString();

        var respA = new QuizQuestionResponse(
                QuizQuestionId.map(UUID.randomUUID().toString()),
                QuizQuestionOptionId.map(UUID.randomUUID().toString()),
                true,
                "A",
                "PT4S");
        var respB = new QuizQuestionResponse(
                QuizQuestionId.map(UUID.randomUUID().toString()),
                QuizQuestionOptionId.map(UUID.randomUUID().toString()),
                false,
                "B",
                "PT6S");

        adapter.save(userId, aggregateId, "quiz", new QuizAnswerMarkedDomainEvent(
                aggregateId, userId, respA, false));
        adapter.save(otherUser, otherAggregate, "quiz", new QuizAnswerMarkedDomainEvent(
                otherAggregate, otherUser, respB, true));

        List<DomainEvent> events = adapter.findAllByUserIdAndAggregateIdAndAggregateType(userId, aggregateId);
        assertEquals(1, events.size());
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, events.getFirst());
        assertEquals("A", ((QuizAnswerMarkedDomainEvent) events.getFirst()).getQuizQuestionResponse().getCorrectAnswer());
    }

    @Test
    void save_persistsAggregateTypeAndEventName() {
        var userId = UserId.map(UUID.randomUUID().toString());
        var aggregateId = UUID.randomUUID().toString();

        var response = new QuizQuestionResponse(
                QuizQuestionId.map(UUID.randomUUID().toString()),
                QuizQuestionOptionId.map(UUID.randomUUID().toString()),
                true,
                "Bank C",
                "PT3S");

        var created = new QuizAnswerMarkedDomainEvent(
                aggregateId,
                userId,
                response,
                true);

        adapter.save(userId, aggregateId, "quiz", created);

        List<DomainEventEntity> stored = jpaRepository.findAllByUserIdAndAggregateId(userId.getValue(), UUID.fromString(aggregateId));
        assertFalse(stored.isEmpty());
        var entity = stored.getFirst();
        assertEquals("quiz", entity.getAggregateType());
        assertEquals("quiz.answer.marked", entity.getEventName());
        assertNotNull(entity.getPayload());
    }
}