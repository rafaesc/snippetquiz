package ai.snippetquiz.core_service.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ai.snippetquiz.core_service.dto.event.QuizGenerationEventPayload;
import ai.snippetquiz.core_service.dto.request.CreateQuestionRequest;
import ai.snippetquiz.core_service.dto.request.QuestionOptionRequest;
import ai.snippetquiz.core_service.entity.QuizStatus;
import ai.snippetquiz.core_service.service.QuizService;
import ai.snippetquiz.core_service.service.RedisPublisher;
import ai.snippetquiz.core_service.service.ContentEntryService;
import ai.snippetquiz.core_service.dto.request.CreateQuizDTO;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class QuizGenerationConsumer {

    private final ObjectMapper objectMapper;
    private final QuizService quizService;
    private final ContentEntryService contentEntryService;
    private final RedisPublisher redisPublisher;

    @KafkaListener(topics = "quiz-generation", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void handleQuizGenerationEvent(String message) {
        try {
            QuizGenerationEventPayload payload = objectMapper.readValue(message, QuizGenerationEventPayload.class);
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
            UUID userId = UUID.fromString(data.userId());
            String quizId = data.quizId();
            if (data.totalChunks() != 0) {
                Long contentEntryId = data.contentEntry().id();
                List<QuizGenerationEventPayload.QuestionDto> questions = data.contentEntry().questions();

                // Create questions for the content entry
                for (QuizGenerationEventPayload.QuestionDto question : questions) {
                    List<QuestionOptionRequest> options = question.options().stream()
                            .map(option -> new QuestionOptionRequest(
                                    option.optionText(),
                                    option.optionExplanation(),
                                    option.isCorrect()))
                            .collect(Collectors.toList());

                    CreateQuestionRequest questionRequest = new CreateQuestionRequest(
                            contentEntryId,
                            question.question(),
                            options);

                    quizService.createQuestion(questionRequest, userId);
                }

                // Update content entry
                contentEntryService.updateContentEntry(userId, contentEntryId.toString());

                log.info("Quiz - {} Content entry {} updated. Progress: {}/{}",
                        quizId, contentEntryId, data.currentChunkIndex() + 1, data.totalChunks());
            }

            // Determine quiz status based on progress
            QuizStatus status;
            if (data.currentChunkIndex() + 1 == data.totalChunks() || Objects.isNull(data.contentEntry())) {
                log.info("All content entries processed. Creating quiz for bankId: {}", data.bankId());
                status = QuizStatus.READY;
            } else {
                status = QuizStatus.IN_PROGRESS;
            }

            // Create or update quiz
            var quizRequest = new CreateQuizDTO(
                    Long.parseLong(data.bankId()),
                    quizId,
                    status);

            String createdQuizId = quizService.createQuiz(userId, quizRequest);

            redisPublisher.sendFanoutMessageQuizGenerationEvent(userId.toString(), data);
            log.info("Quiz created successfully Quiz ID: {}", createdQuizId);

        } catch (Exception e) {
            log.error("Failed to handle save event for quiz: {}", data.quizId(), e);
            throw e;
        }
    }
}