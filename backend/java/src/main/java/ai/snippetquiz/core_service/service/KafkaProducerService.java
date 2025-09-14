package ai.snippetquiz.core_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.dto.request.ContentEntryDto;
import ai.snippetquiz.core_service.dto.request.CreateQuizRequest;
import ai.snippetquiz.core_service.dto.request.GenerateQuizRequest;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void emitGenerateTopicsEvent(String userId, String contentId,
            String content, String pageTitle, String existingTopics) {
        try {
            var payload = new ContentEntryEventPayload(
                    userId, contentId, "GENERATE", content, pageTitle, existingTopics);

            var key = "content-entry-" + contentId;
            var jsonPayload = objectMapper.writeValueAsString(payload);

            kafkaTemplate.send("content-entry-events", key, jsonPayload);

            log.info("Content entry event emitted for contentId: {}, action: {}", contentId, "GENERATE");

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize content entry event payload", e);
            throw new RuntimeException("Failed to emit content entry event", e);
        }
    }

    public void emitCreateQuizEvent(
        GenerateQuizRequest quizRequest, String userId, String quizId, Integer bankId, Integer entriesSkipped) {
        try {
            var payload = new CreateQuizGenerationEventPayload(
                    quizRequest.instructions(),
                    quizRequest.contentEntries(),
                    entriesSkipped,
                    quizId,
                    userId,
                    bankId
            );

            var key = "user-" + userId;
            var jsonPayload = objectMapper.writeValueAsString(payload);

            kafkaTemplate.send("create-quiz", key, jsonPayload);

            log.info("Create quiz event emitted for quizId: {}, bankId: {}, userId: {}", quizId, bankId, userId);

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize create quiz event payload", e);
            throw new RuntimeException("Failed to emit create quiz event", e);
        }
    }

    // Inner record class for the content entry event payload
    public record ContentEntryEventPayload(
            String userId,
            String contentId,
            String action,
            String content,
            String pageTitle,
            String existingTopics) {
    }

    // Inner record class for the create quiz generation event payload
    public record CreateQuizGenerationEventPayload(
            String instructions,
            List<ContentEntryDto> contentEntries,
            Integer entriesSkipped,
            String quizId,
            String userId,
            Integer bankId) {
    }
}