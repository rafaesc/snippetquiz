package ai.snippetquiz.core_service.quiz.application.consumer;

import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
<<<<<<< HEAD:backend/java/src/test/java/ai/snippetquiz/core_service/quiz/application/consumer/AIQuestionGeneratedHandlerTest.java
=======
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.events.AIQuestionGeneratedEvent;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.EventPubSubBus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
>>>>>>> 363c56c (feat: core service and ai processor event driven):backend/java/src/test/java/ai/snippetquiz/core_service/quiz/application/consumer/AiQuestionGeneratedHandlerTest.java
import ai.snippetquiz.core_service.question.application.QuestionService;
import ai.snippetquiz.core_service.question.application.dto.CreateQuestionRequest;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.events.AIQuestionGeneratedEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizProgressEphemeralEvent;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.shared.domain.service.EventSourcingHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AIQuestionGeneratedHandlerTest {

    @Mock
    private EventSourcingHandler<Quiz, QuizId> quizEventSourcingHandler;
    @Mock
    private QuizService quizService;
    @Mock
    private ContentEntryRepository contentEntryRepository;
    @Mock
    private QuestionService questionService;
    @Mock
    private EventBus eventBus;

    @InjectMocks
    private AIQuestionGeneratedHandler consumer;

    @Test
    void onIntegrationEvent_processesQuestionsAndUpdatesEntry() {
        UUID quizId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        String contentEntryIdStr = UUID.randomUUID().toString();

        var option = new AIQuestionGeneratedEvent.QuestionOptionDto("opt", "exp", true);
        var question = new AIQuestionGeneratedEvent.QuestionDto("Q1", "MCQ", List.of(option));
        var contentEntryDto = new AIQuestionGeneratedEvent.ContentEntryDto(contentEntryIdStr, "Title", 10, List.of(question));

        var event = new AIQuestionGeneratedEvent(
                quizId,
                userId,
                UUID.randomUUID(),
                "2024-01-01T00:00:00",
                0,
                1,
                0,
                0,
                0,
                contentEntryDto,
                1,
                0,
                UUID.randomUUID()
        );

        var quiz = new Quiz();
        when(quizEventSourcingHandler.getById(eq(userId), eq(new QuizId(quizId)))).thenReturn(Optional.of(quiz));

        var entry = new ContentEntry();
        entry.setId(ContentEntryId.map(contentEntryIdStr));
        entry.setUserId(userId);

        when(contentEntryRepository.findByIdAndUserId(eq(ContentEntryId.map(contentEntryIdStr)), eq(userId))).thenReturn(Optional.of(entry));

        consumer.on(event);

        verify(questionService, times(1)).createQuestion(any(CreateQuestionRequest.class), eq(userId.getValue()));
        verify(contentEntryRepository, times(1)).save(any(ContentEntry.class));
        verify(eventBus, times(1)).publish(eq(entry.aggregateType()), any());
        verify(eventBus, times(1)).publish(eq(QuizProgressEphemeralEvent.eventName()), any());
        verify(quizService, times(1)).processNewQuizQuestions(eq(quiz), any());
<<<<<<< HEAD:backend/java/src/test/java/ai/snippetquiz/core_service/quiz/application/consumer/AIQuestionGeneratedHandlerTest.java
=======
        verify(eventPubSubBus, times(1)).publish(any(AIQuestionGeneratedEvent.class));
>>>>>>> 363c56c (feat: core service and ai processor event driven):backend/java/src/test/java/ai/snippetquiz/core_service/quiz/application/consumer/AiQuestionGeneratedHandlerTest.java
    }
}