package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.domain.events.QuizAnswerMarkedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizCreatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizQuestionsAddedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizStatusUpdatedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QuizTest {

    private Quiz newQuiz(UUID quizUuid, UUID userUuid, UUID bankUuid) {
        return new Quiz(
                QuizId.map(quizUuid.toString()),
                UserId.map(userUuid.toString()),
                ContentBankId.map(bankUuid.toString()),
                "Test Bank");
    }

    @Test
    void constructor_recordsCreatedEvent_and_appliesInitialState() {
        var quizUuid = UUID.randomUUID();
        var userUuid = UUID.randomUUID();
        var bankUuid = UUID.randomUUID();

        var quiz = newQuiz(quizUuid, userUuid, bankUuid);

        assertNotNull(quiz.getId());
        assertEquals(quizUuid, quiz.getId().getValue());
        assertEquals(userUuid, quiz.getUserId().getValue());
        assertEquals(bankUuid, quiz.getContentBankId().getValue());
        assertEquals("Test Bank", quiz.getBankName());
        assertEquals(QuizStatus.PREPARE, quiz.getStatus());
        assertNotNull(quiz.getCreatedAt());
        assertNotNull(quiz.getQuizQuestions());
        assertNotNull(quiz.getQuizQuestionResponses());

        var events = quiz.pullUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(QuizCreatedDomainEvent.class, events.getFirst());
    }

    @Test
    void updateStatus_recordsEvent_and_updatesStatus() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        quiz.markChangesAsCommitted(); // isolate this behavior

        quiz.updateStatus(QuizStatus.IN_PROGRESS);

        assertEquals(QuizStatus.IN_PROGRESS, quiz.getStatus());
        var events = quiz.pullUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(QuizStatusUpdatedDomainEvent.class, events.getFirst());
    }

    @Test
    void addQuestions_recordsEvent_and_appliesFields() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        quiz.markChangesAsCommitted(); // isolate this behavior

        var topics = Set.of("Topic A", "Topic B");
        var questions = new ArrayList<QuizQuestion>();
        questions.add(new QuizQuestion());

        quiz.addQuestions(QuizStatus.IN_PROGRESS, 5, topics, questions);

        assertEquals(QuizStatus.IN_PROGRESS, quiz.getStatus());
        assertEquals(topics, quiz.getQuizTopics());
        assertNotNull(quiz.getContentEntriesCount());
        assertEquals(5, quiz.getContentEntriesCount().getValue());
        assertEquals(1, quiz.getQuizQuestions().size());
        assertNotNull(quiz.getQuestionUpdatedAt());

        var events = quiz.pullUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(QuizQuestionsAddedDomainEvent.class, events.getFirst());
    }

    @Test
    void answerMarked_whenNotLastQuestion_recordsEvent_and_doesNotComplete() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        var topics = Set.of("Topic A");
        var questions = new ArrayList<QuizQuestion>();
        questions.add(new QuizQuestion());
        questions.add(new QuizQuestion());
        quiz.addQuestions(QuizStatus.READY, 2, topics, questions);
        quiz.markChangesAsCommitted(); // isolate this behavior

        var response = new QuizQuestionResponse();
        quiz.answerMarked(response);

        assertEquals(1, quiz.getQuizQuestionResponses().size());
        assertEquals(Boolean.FALSE, quiz.getIsAllQuestionsMarked());

        var events = quiz.pullUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, events.getFirst());
        assertFalse(((QuizAnswerMarkedDomainEvent) events.getFirst()).isAllQuestionsMarked());
    }

    @Test
    void answerMarked_whenLastQuestion_andReady_completesQuiz() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        var topics = Set.of("Topic A");
        var questions = List.of(new QuizQuestion());
        quiz.addQuestions(QuizStatus.READY, 1, topics, new ArrayList<>(questions));
        quiz.markChangesAsCommitted(); // isolate this behavior

        var response = new QuizQuestionResponse();
        quiz.answerMarked(response);

        assertEquals(1, quiz.getQuizQuestionResponses().size());
        assertEquals(Boolean.TRUE, quiz.getIsAllQuestionsMarked());

        var events = quiz.pullUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, events.getFirst());
        assertTrue(((QuizAnswerMarkedDomainEvent) events.getFirst()).isAllQuestionsMarked());
    }

    @Test
    void answerMarked_whenAlreadyCompleted_doesNotRecordNewEvent() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        var questions = List.of(new QuizQuestion());
        quiz.addQuestions(QuizStatus.READY, 1, Set.of("Topic"), new ArrayList<>(questions));
        quiz.markChangesAsCommitted(); // isolate this behavior

        // First mark completes the quiz
        quiz.answerMarked(new QuizQuestionResponse());
        var firstBatch = quiz.pullUncommittedChanges();
        assertEquals(1, firstBatch.size());
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, firstBatch.getFirst());
        assertEquals(Boolean.TRUE, quiz.getIsAllQuestionsMarked());
        quiz.markChangesAsCommitted();

        // Second mark should be ignored
        quiz.answerMarked(new QuizQuestionResponse());
        var secondBatch = quiz.pullUncommittedChanges();
        assertEquals(0, secondBatch.size());
    }

    @Test
    void delete_recordsEvent_and_deactivates_which_blocksFurtherNonDeactivationEvents() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        quiz.markChangesAsCommitted(); // isolate this behavior

        quiz.delete();

        var events = quiz.pullUncommittedChanges();
        assertEquals(1, events.size());
        assertInstanceOf(QuizDeletedDomainEvent.class, events.getFirst());

        // After delete, applying a non-deactivation event should throw
        assertThrows(IllegalStateException.class, () -> quiz.updateStatus(QuizStatus.READY));
    }

    @Test
    void multipleAddQuestions_and_multipleAnswerMarked_lastIsAllQuestionsMarkedTrue() {
        var quiz = newQuiz(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

        var topics1 = Set.of("Topic A");
        quiz.addQuestions(QuizStatus.IN_PROGRESS, 0, topics1, new ArrayList<>());

        var topics2 = Set.of("Topic B");
        var questionsBatch = new ArrayList<QuizQuestion>();
        questionsBatch.add(new QuizQuestion());
        quiz.addQuestions(QuizStatus.IN_PROGRESS, 1, topics2, questionsBatch);

        quiz.markChangesAsCommitted();

        var questionsBatchReady = new ArrayList<QuizQuestion>();
        questionsBatchReady.add(new QuizQuestion());
        quiz.addQuestions(QuizStatus.READY, 1, topics2, questionsBatchReady);

        quiz.markChangesAsCommitted();

        var questionResponse = new QuizQuestionResponse();
        questionResponse.setQuizQuestion(questionsBatch.get(0).getId());
        quiz.answerMarked(questionResponse);

        var questionReadyResponse = new QuizQuestionResponse();
        questionReadyResponse.setQuizQuestion(questionsBatchReady.get(0).getId());
        quiz.answerMarked(questionReadyResponse);

        assertEquals(2, quiz.getQuizQuestions().size());
        assertEquals(2, quiz.getQuizQuestionResponses().size());
        assertEquals(Boolean.TRUE, quiz.getIsAllQuestionsMarked());

        var events = quiz.pullUncommittedChanges();
        assertEquals(2, events.size());
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, events.getFirst());
        assertFalse(((QuizAnswerMarkedDomainEvent) events.getFirst()).isAllQuestionsMarked());
        assertInstanceOf(QuizAnswerMarkedDomainEvent.class, events.getLast());
        assertTrue(((QuizAnswerMarkedDomainEvent) events.getLast()).isAllQuestionsMarked());
    }
}