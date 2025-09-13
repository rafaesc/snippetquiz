package ai.snippetquiz.core_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

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

    // Inner record class for the event payload
    public record ContentEntryEventPayload(
            String userId,
            String contentId,
            String action,
            String content,
            String pageTitle,
            String existingTopics) {
    }
}