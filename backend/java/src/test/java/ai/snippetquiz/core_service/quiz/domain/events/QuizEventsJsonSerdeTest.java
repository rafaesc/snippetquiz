package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionContentEntryChunkId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionContentEntryQuestionChunkId;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionOption;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.ContentEntryCount;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SuppressWarnings("unchecked")
class QuizEventsJsonSerdeTest {

    private <T extends DomainEvent> T roundtrip(T event) throws Exception {
        DomainEventsInformation info = new DomainEventsInformation();
        DomainEventJsonDeserializer deserializer = new DomainEventJsonDeserializer(info);

        String json = DomainEventJsonSerializer.serialize(event);
        DomainEvent deserialized = deserializer.deserialize(json);
        assertNotNull(deserialized);
        //noinspection unchecked
        return (T) deserialized;
    }

    @Test
    void roundtrip_QuizCreated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String contentBankId = UUID.randomUUID().toString();
        String bankName = "Bank A";
        QuizStatus status = QuizStatus.PREPARE;
        LocalDateTime createdAt = LocalDateTime.of(2024, 1, 2, 3, 4, 5);

        QuizCreatedDomainEvent original = new QuizCreatedDomainEvent(
                aggregateId, userId, contentBankId, bankName, status, createdAt);

        QuizCreatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(QuizCreatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());

        assertEquals(contentBankId, reconstructed.getContentBankId());
        assertEquals(bankName, reconstructed.getBankName());
        assertEquals(status, reconstructed.getStatus());
        assertEquals(createdAt, reconstructed.getCreatedAt());
    }

    @Test
    void roundtrip_QuizDeleted() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());

        QuizDeletedDomainEvent original = new QuizDeletedDomainEvent(aggregateId, userId);

        QuizDeletedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(QuizDeletedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
    }

    @Test
    void roundtrip_QuizStatusUpdated() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        QuizStatus status = QuizStatus.IN_PROGRESS;

        QuizStatusUpdatedDomainEvent original = new QuizStatusUpdatedDomainEvent(aggregateId, userId, status);

        QuizStatusUpdatedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(QuizStatusUpdatedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());
        assertEquals(status, reconstructed.getStatus());
    }

    @Test
    void roundtrip_QuizQuestionsAdded() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        Set<String> quizTopics = new HashSet<>(Arrays.asList("java", "spring"));
        QuizStatus status = QuizStatus.READY;
        LocalDateTime updatedAt = LocalDateTime.of(2024, 3, 4, 5, 6, 7);
        ContentEntryCount contentEntriesCount = new ContentEntryCount(3);

        // Build a sample question
        QuizQuestion question = new QuizQuestion();
        question.setChunkIndex(new QuestionContentEntryChunkId(1));
        question.setQuestionIndexInChunk(new QuestionContentEntryQuestionChunkId(2));
        question.setQuestion("What is Spring Boot?");
        question.setType("MCQ");
        question.setContentEntryType(ContentType.SELECTED_TEXT);
        question.setContentEntrySourceUrl("https://example.com/spring");
        question.setContentEntryId(new ContentEntryId(UUID.randomUUID()));

        QuizQuestionOption option = new QuizQuestionOption();
        option.setOptionText("A Java framework");
        option.setOptionExplanation("Spring Boot simplifies building applications.");
        option.setIsCorrect(true);
        question.getQuizQuestionOptions().add(option);

        List<QuizQuestion> quizQuestions = List.of(question);

        QuizQuestionsAddedDomainEvent original = new QuizQuestionsAddedDomainEvent(
                aggregateId, userId, quizTopics, status, updatedAt, contentEntriesCount, quizQuestions);

        QuizQuestionsAddedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(QuizQuestionsAddedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());

        assertEquals(quizTopics, reconstructed.getQuizTopics());
        assertEquals(status, reconstructed.getStatus());
        assertEquals(updatedAt, reconstructed.getUpdatedAt());
        assertEquals(contentEntriesCount.getValue(), reconstructed.getContentEntriesCount().getValue());
        assertNotNull(reconstructed.getQuizQuestions());
        assertEquals(1, reconstructed.getQuizQuestions().size());

        QuizQuestion rq = reconstructed.getQuizQuestions().get(0);
        assertEquals(question.getQuestion(), rq.getQuestion());
        assertEquals(question.getType(), rq.getType());
        assertEquals(question.getContentEntryType(), rq.getContentEntryType());
        assertEquals(question.getContentEntrySourceUrl(), rq.getContentEntrySourceUrl());
        assertEquals(question.getChunkIndex(), rq.getChunkIndex());
        assertEquals(question.getQuestionIndexInChunk(), rq.getQuestionIndexInChunk());
        assertEquals(question.getContentEntryId(), rq.getContentEntryId());
        assertEquals(1, rq.getQuizQuestionOptions().size());

        QuizQuestionOption ro = rq.getQuizQuestionOptions().iterator().next();
        assertEquals(option.getOptionText(), ro.getOptionText());
        assertEquals(option.getOptionExplanation(), ro.getOptionExplanation());
        assertEquals(option.getIsCorrect(), ro.getIsCorrect());
    }

    @Test
    void roundtrip_QuizAnswerMarked() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());

        QuizQuestionResponse response = new QuizQuestionResponse(
                new QuizQuestionId(UUID.randomUUID()),
                new QuizQuestionOptionId(UUID.randomUUID()),
                true,
                "A Java framework",
                "1.234s"
        );

        QuizAnswerMarkedDomainEvent original =
                new QuizAnswerMarkedDomainEvent(aggregateId, userId, response, true);

        QuizAnswerMarkedDomainEvent reconstructed = roundtrip(original);

        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, reconstructed);
        assertEquals(original.getAggregateId(), reconstructed.getAggregateId());
        assertEquals(original.getUserId(), reconstructed.getUserId());
        assertEquals(original.getEventId(), reconstructed.getEventId());
        assertEquals(original.getOccurredOn(), reconstructed.getOccurredOn());

        assertNotNull(reconstructed.getQuizQuestionResponse());
        assertEquals(response.getQuizQuestion(), reconstructed.getQuizQuestionResponse().getQuizQuestion());
        assertEquals(response.getQuizQuestionOption(), reconstructed.getQuizQuestionResponse().getQuizQuestionOption());
        assertEquals(response.getIsCorrect(), reconstructed.getQuizQuestionResponse().getIsCorrect());
        assertEquals(response.getCorrectAnswer(), reconstructed.getQuizQuestionResponse().getCorrectAnswer());
        assertEquals(response.getResponseTime(), reconstructed.getQuizQuestionResponse().getResponseTime());
        assertTrue(reconstructed.isAllQuestionsMarked());
    }
}