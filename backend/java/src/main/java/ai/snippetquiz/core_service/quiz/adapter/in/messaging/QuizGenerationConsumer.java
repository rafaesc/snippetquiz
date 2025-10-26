package ai.snippetquiz.core_service.quiz.adapter.in.messaging;


import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.application.QuestionService;
import ai.snippetquiz.core_service.question.application.dto.CreateQuestionRequest;
import ai.snippetquiz.core_service.question.application.dto.QuestionOptionRequest;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.events.QuizGenerationEventPayload;
import ai.snippetquiz.core_service.quiz.domain.model.QuizStatus;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.SendFanoutMessageQuizLoadingEvent;
import ai.snippetquiz.core_service.quiz.domain.port.repository.QuizRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuizGenerationConsumer {

    private final ObjectMapper objectMapper;
    private final QuizRepository quizRepository;
    private final QuizService quizService;
    private final ContentEntryRepository contentEntryRepository;
    private final QuestionService questionService;
    private final SendFanoutMessageQuizLoadingEvent sendFanoutMessageQuizLoadingEvent;

    @KafkaListener(topics = "quiz-generation", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void handleQuizGenerationEvent(String message) {
        try {
            var payload = objectMapper.readValue(message, QuizGenerationEventPayload.class);
            log.info("Received quiz generation event: {}", payload);

            handleSaveEvent(payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse quiz generation event message: {}", message, e);
        } catch (Exception e) {
            log.error("Failed to process quiz-generation event", e);
        }
    }

    private void handleSaveEvent(QuizGenerationEventPayload data) {
        try {
            var userId = UUID.fromString(data.userId());
            var quizId = data.quizId();
            var quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new NotFoundException(
                            "Quiz not found or you do not have permission to access it"));

            if (QuizStatus.READY.equals(quiz.getStatus())) {
                log.warn("Quiz {} is not in progress", quizId);
                return;
            }

            if (data.totalChunks() != 0) {
                var contentEntryId = data.contentEntry().id();
                var contentEntry = contentEntryRepository
                        .findByIdAndUserId(new ContentEntryId(contentEntryId), new UserId(userId))
                        .orElseThrow(() -> new NotFoundException("Content entry not found or access denied"));

                var questions = data.contentEntry().questions();
                for (var questionIndexInChunk = 0; questionIndexInChunk < questions.size(); questionIndexInChunk++) {
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
                            data.currentChunkIndex(),
                            options);

                    questionService.createQuestion(questionRequest, userId);
                }

                contentEntry.setQuestionsGenerated(true);
                contentEntryRepository.save(contentEntry);

                log.info("Quiz - {} Content entry {} updated. Progress: {}/{}",
                        quizId, contentEntryId, data.currentChunkIndex() + 1, data.totalChunks());
            }

            QuizStatus status;
            if (data.currentChunkIndex() + 1 == data.totalChunks() || Objects.isNull(data.contentEntry())) {
                log.info("All content entries processed. Creating quiz for bankId: {}", data.bankId());
                status = QuizStatus.READY;
            } else {
                status = QuizStatus.IN_PROGRESS;
            }

            quizService.processNewQuizQuestions(quiz, status);

            sendFanoutMessageQuizLoadingEvent.sendFanoutMessageQuizGenerationEvent(userId.toString(), data);
            log.info("Quiz created successfully Quiz ID: {}", quizId);

        } catch (Exception e) {
            log.error("Failed to handle save event for quiz: {}", data.quizId(), e);
            throw e;
        }
    }
}