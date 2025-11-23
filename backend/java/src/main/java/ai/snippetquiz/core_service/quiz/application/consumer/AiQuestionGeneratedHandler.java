package ai.snippetquiz.core_service.quiz.application.consumer;

import ai.snippetquiz.core_service.quiz.domain.events.AIQuestionGeneratedEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizGenerationEventPayload;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.EventPubSubBus;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriberFor;
import ai.snippetquiz.core_service.shared.domain.service.EventSourcingHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.application.QuestionService;
import ai.snippetquiz.core_service.question.application.dto.CreateQuestionRequest;
import ai.snippetquiz.core_service.question.application.dto.QuestionOptionRequest;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@IntegrationEventSubscriberFor({AIQuestionGeneratedEvent.class})
public class AiQuestionGeneratedHandler implements IntegrationEventSubscriber {

    private final EventSourcingHandler<Quiz, QuizId> quizEventSourcingHandler;
    private final QuizService quizService;
    private final ContentEntryRepository contentEntryRepository;
    private final QuestionService questionService;
    private final EventPubSubBus eventPubSubBus;
    private final EventBus eventBus;

    @Override
    public void on(IntegrationEvent event) {
        if (!(event instanceof AIQuestionGeneratedEvent e)) {
            log.warn("Received unexpected integration event type: {}", event.getClass().getName());
            return;
        }
        log.info("Received AiQuestionGeneratedHandler: {}", e.getAggregateId());

        try {
            UUID userUuid = event.getUserId();
            UUID quizUuid = event.getAggregateId();
            var userId = new UserId(userUuid);
            var quizId = new QuizId(quizUuid);

            var quiz = quizEventSourcingHandler.getById(userId, quizId)
                    .orElseThrow(() -> new NotFoundException(
                            "Quiz not found or you do not have permission to access it"));

            if (QuizStatus.READY.equals(quiz.getStatus())) {
                log.warn("Quiz {} is not in progress", quizUuid);
                return;
            }

            if (e.getTotalChunks() != null && e.getTotalChunks() != 0 && e.getContentEntry() != null) {
                var contentEntryId = e.getContentEntry().id();
                var contentEntry = contentEntryRepository
                        .findByIdAndUserId(ContentEntryId.map(contentEntryId), userId)
                        .orElseThrow(() -> new NotFoundException("Content entry not found or access denied"));

                var questions = e.getContentEntry().questions();
                for (int questionIndexInChunk = 0; questionIndexInChunk < questions.size(); questionIndexInChunk++) {
                    var question = questions.get(questionIndexInChunk);

                    var options = question.options().stream()
                            .map(option -> new QuestionOptionRequest(
                                    option.optionText(),
                                    option.optionExplanation(),
                                    option.isCorrect()))
                            .toList();

                    var questionRequest = new CreateQuestionRequest(
                            contentEntryId,
                            question.question(),
                            questionIndexInChunk,
                            e.getCurrentChunkIndex(),
                            options);

                    questionService.createQuestion(questionRequest, userUuid);
                }

                if (Boolean.FALSE.equals(contentEntry.getQuestionsGenerated())) {
                    contentEntry.questionsGenerated();
                }

                contentEntryRepository.save(contentEntry);
                eventBus.publish(contentEntry.aggregateType(), contentEntry.drainDomainEvents());

                log.info("Quiz - {} Content entry {} updated. Progress: {}/{}",
                        quizUuid, contentEntryId, e.getCurrentChunkIndex() + 1, e.getTotalChunks());
            }

            QuizStatus status;
            if ((e.getCurrentChunkIndex() != null && e.getTotalChunks() != null && (e.getCurrentChunkIndex() + 1 == e.getTotalChunks()))
                    || e.getContentEntry() == null) {
                log.info("All content entries processed. Creating quiz for bankId: {}", e.getBankId());
                status = QuizStatus.READY;
            } else {
                status = QuizStatus.IN_PROGRESS;
            }

            quizService.processNewQuizQuestions(quiz, status);

            var payload = new QuizGenerationEventPayload(
                    quizUuid.toString(),
                    e.getBankId() != null ? e.getBankId().toString() : null,
                    userUuid.toString(),
                    e.getTotalContentEntries(),
                    e.getTotalContentEntriesSkipped(),
                    e.getCurrentContentEntryIndex(),
                    e.getQuestionsGeneratedSoFar(),
                    e.getContentEntry(),
                    e.getTotalChunks(),
                    e.getCurrentChunkIndex()
            );

            eventPubSubBus.publish(userUuid.toString(), payload);
            log.info("Quiz created successfully Quiz ID: {}", quizUuid);

        } catch (Exception ex) {
            log.error("Failed to handle integration event for quiz: {}", event.getAggregateId(), ex);
            throw ex;
        }
    }
}