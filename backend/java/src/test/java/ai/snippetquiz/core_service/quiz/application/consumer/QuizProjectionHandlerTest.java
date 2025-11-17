package ai.snippetquiz.core_service.quiz.application.consumer;

import ai.snippetquiz.core_service.quiz.domain.events.QuizAnswerMarkedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizQuestionsAddedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizStatusUpdatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.model.QuizProjection;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestion;
import ai.snippetquiz.core_service.quiz.domain.model.QuizQuestionResponse;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizProjectionRepository;
import ai.snippetquiz.core_service.quiz.domain.valueobject.ContentEntryCount;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionId;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizQuestionOptionId;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizProjectionHandlerTest {

    @Mock
    private QuizProjectionRepository repository;

    @InjectMocks
    private QuizProjectionHandler handler;

    @Test
    void onQuizCreated_upsertsNewProjectionWithInitialValues() {
        var quizId = UUID.randomUUID();
        var userId = new UserId(UUID.randomUUID());
        var contentBankId = UUID.randomUUID().toString();
        var bankName = "Sample Bank";
        var createdAt = LocalDateTime.now();
        var status = QuizStatus.PREPARE;

        DomainEvent event = new QuizCreatedDomainEvent(
                quizId,
                userId,
                contentBankId,
                bankName,
                status,
                createdAt
        );

        var captor = ArgumentCaptor.forClass(QuizProjection.class);

        handler.on(event);

        verify(repository).upsert(captor.capture());
        var projection = captor.getValue();

        assertEquals(new QuizId(quizId), projection.getId());
        assertEquals(userId, projection.getUserId());
        assertEquals(bankName, projection.getBankName());
        assertEquals(status, projection.getStatus());
        assertEquals(createdAt, projection.getCreatedAt());
        assertNotNull(projection.getQuestions());
        assertTrue(projection.getQuestions().isEmpty());
        assertNotNull(projection.getResponses());
        assertTrue(projection.getResponses().isEmpty());
    }

    @Test
    void onQuizStatusUpdated_setsStatus() {
        var quizId = UUID.randomUUID();
        var userId = new UserId(UUID.randomUUID());
        var status = QuizStatus.IN_PROGRESS;

        DomainEvent event = new QuizStatusUpdatedDomainEvent(
                quizId,
                userId,
                status
        );

        var captor = ArgumentCaptor.forClass(QuizProjection.class);

        handler.on(event);

        verify(repository).upsert(captor.capture());
        var projection = captor.getValue();

        assertEquals(new QuizId(quizId), projection.getId());
        assertEquals(status, projection.getStatus());
    }

    @Test
    void onQuizQuestionsAdded_updatesQuestionsTopicsCountAndStatus() {
        var quizUuid = UUID.randomUUID();
        var quizId = new QuizId(quizUuid);
        var userId = new UserId(UUID.randomUUID());

        // existing projection with one question
        var existingQuestionId = UUID.randomUUID().toString();
        var current = QuizProjection.builder()
                .id(quizId)
                .questions(new HashSet<>(Set.of(existingQuestionId)))
                .responses(new HashSet<>())
                .build();

        when(repository.findById(quizId)).thenReturn(current);

        // new questions
        var q1 = new QuizQuestion(); // default constructor sets random id
        var q2 = new QuizQuestion();

        var topics = Set.of("topic-a", "topic-b");
        var status = QuizStatus.IN_PROGRESS;
        var updatedAt = LocalDateTime.now();
        var contentEntriesCount = new ContentEntryCount(5);

        DomainEvent event = new QuizQuestionsAddedDomainEvent(
                quizUuid,
                userId,
                topics,
                status,
                updatedAt,
                contentEntriesCount,
                List.of(q1, q2)
        );

        var captor = ArgumentCaptor.forClass(QuizProjection.class);

        handler.on(event);

        verify(repository).upsert(captor.capture());
        var projection = captor.getValue();

        assertEquals(quizId, projection.getId());
        assertEquals(topics, projection.getTopics());
        assertEquals(status, projection.getStatus());
        assertEquals(updatedAt, projection.getQuestionUpdatedAt());
        assertEquals(contentEntriesCount.getValue(), projection.getContentEntriesCount());

        // questions set should contain existing + new ids
        assertNotNull(projection.getQuestions());
        assertTrue(projection.getQuestions().contains(existingQuestionId));
        assertTrue(projection.getQuestions().contains(q1.getId().toString()));
        assertTrue(projection.getQuestions().contains(q2.getId().toString()));

        assertEquals(projection.getQuestions().size(), projection.getQuestionsCount());
    }

    @Test
    void onQuizAnswerMarked_updatesResponsesAndCompletedCount() {
        var quizUuid = UUID.randomUUID();
        var quizId = new QuizId(quizUuid);
        var userId = new UserId(UUID.randomUUID());

        var existingResponseQuestionId = UUID.randomUUID().toString();
        var current = QuizProjection.builder()
                .id(quizId)
                .responses(new HashSet<>(Set.of(existingResponseQuestionId)))
                .questions(new HashSet<>())
                .build();

        when(repository.findById(quizId)).thenReturn(current);

        var respondedQuestionId = UUID.randomUUID();
        var response = new QuizQuestionResponse(
                new QuizQuestionId(respondedQuestionId),
                new QuizQuestionOptionId(UUID.randomUUID()),
                true,
                "Correct",
                "3s"
        );

        DomainEvent event = new QuizAnswerMarkedDomainEvent(
                quizUuid,
                userId,
                response,
                false
        );

        var captor = ArgumentCaptor.forClass(QuizProjection.class);

        handler.on(event);

        verify(repository).upsert(captor.capture());
        var projection = captor.getValue();

        assertEquals(quizId, projection.getId());
        assertTrue(projection.getResponses().contains(existingResponseQuestionId));
        assertTrue(projection.getResponses().contains(respondedQuestionId.toString()));
        assertEquals(projection.getResponses().size(), projection.getQuestionsCompleted());
    }

    @Test
    void onQuizDeleted_callsDeleteAndNoUpsert() {
        var quizId = UUID.randomUUID();
        var userId = new UserId(UUID.randomUUID());

        DomainEvent event = new QuizDeletedDomainEvent(
                quizId,
                userId
        );

        handler.on(event);

        verify(repository).deleteById(new QuizId(quizId));
        verify(repository, never()).upsert(any());
    }
}