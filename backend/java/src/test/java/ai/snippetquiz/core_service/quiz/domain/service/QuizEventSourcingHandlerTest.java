package ai.snippetquiz.core_service.quiz.domain.service;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizStatusUpdatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.shared.domain.port.repository.DomainEventRepository;
import ai.snippetquiz.core_service.shared.domain.service.EventStore;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QuizEventSourcingHandlerTest {

    @Test
    void save_persists_uncommitted_events_and_marks_committed() {
        @SuppressWarnings("unchecked")
        DomainEventRepository<DomainEvent> repo = mock(DomainEventRepository.class);
        EventBus eventBus = mock(EventBus.class);
        EventStore eventStore = new EventStore(repo, eventBus);
        QuizEventSourcingHandler handler = new QuizEventSourcingHandler(eventStore);

        when(repo.findAllByUserIdAndAggregateIdAndAggregateType(any(UserId.class), anyString()))
                .thenReturn(new ArrayList<>());

        when(repo.save(any(UserId.class), anyString(), anyString(), any(DomainEvent.class)))
                .thenAnswer(invocation -> invocation.getArgument(3));

        var quizId = new QuizId(UUID.randomUUID());
        var userId = new UserId(UUID.randomUUID());
        var bankId = new ContentBankId(UUID.randomUUID());
        var quiz = new Quiz(quizId, userId, bankId, "Bank Name");

        assertFalse(quiz.getUncommittedChanges().isEmpty(), "Precondition: there should be 1 uncommitted event");

        handler.save(quiz);

        ArgumentCaptor<DomainEvent> eventCaptor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(repo, times(1)).save(any(UserId.class), eq(quiz.getId().toString()), eq("quiz-aggregate"), eventCaptor.capture());
        assertEquals(0, eventCaptor.getValue().getVersion(), "First persisted event should have version 0");

        assertTrue(quiz.getUncommittedChanges().isEmpty(), "Uncommitted changes must be cleared after save");
    }

    @Test
    void get_by_id_returns_empty_when_no_events() {
        @SuppressWarnings("unchecked")
        DomainEventRepository<DomainEvent> repo = mock(DomainEventRepository.class);
        EventBus eventBus = mock(EventBus.class);
        EventStore eventStore = new EventStore(repo, eventBus);
        QuizEventSourcingHandler handler = new QuizEventSourcingHandler(eventStore);

        var userId = new UserId(UUID.randomUUID());
        var quizId = UUID.randomUUID().toString();

        when(repo.findAllByUserIdAndAggregateIdAndAggregateType(eq(userId), eq(quizId)))
                .thenReturn(List.of());

        var result = handler.getById(userId, quizId);

        assertTrue(result.isEmpty(), "Should return Optional.empty when no events exist");
    }

    @Test
    void get_by_id_replays_events_and_sets_latest_version() {
        @SuppressWarnings("unchecked")
        DomainEventRepository<DomainEvent> repo = mock(DomainEventRepository.class);
        EventBus eventBus = mock(EventBus.class);
        EventStore eventStore = new EventStore(repo, eventBus);
        QuizEventSourcingHandler handler = new QuizEventSourcingHandler(eventStore);

        var userId = new UserId(UUID.randomUUID());
        var quizUuid = UUID.randomUUID();
        var quizIdStr = quizUuid.toString();
        var bankIdStr = UUID.randomUUID().toString();
        var bankName = "Bank Name";

        var created = new QuizCreatedDomainEvent(
                quizIdStr,
                userId,
                bankIdStr,
                bankName,
                QuizStatus.PREPARE,
                LocalDateTime.now());
        created.setVersion(0);

        var statusUpdated = new QuizStatusUpdatedDomainEvent(
                quizIdStr,
                userId,
                QuizStatus.READY);
        statusUpdated.setVersion(1);

        when(repo.findAllByUserIdAndAggregateIdAndAggregateType(eq(userId), eq(quizIdStr)))
                .thenReturn(List.of(created, statusUpdated));

        var result = handler.getById(userId, quizIdStr);

        assertTrue(result.isPresent(), "Aggregate should be reconstructed from events");

        var quiz = result.get();
        assertEquals(quizIdStr, quiz.getId().toString(), "Aggregate ID should match");
        assertEquals(bankName, quiz.getBankName(), "Bank name should be applied from creation event");
        assertEquals(QuizStatus.READY, quiz.getStatus(), "Status should reflect latest event");
        assertEquals(1, quiz.getVersion(), "Aggregate version should be latest version in stream");
        assertNotNull(quiz.getQuizQuestions(), "Questions list initialized on creation");
        assertNotNull(quiz.getQuizQuestionResponses(), "Responses list initialized on creation");
    }
}