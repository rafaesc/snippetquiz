package ai.snippetquiz.core_service.contentbank.adapter.out.messaging;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryEventPayload;
import ai.snippetquiz.core_service.contentbank.domain.port.out.ContentEntryEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContentEntryEventPublisherImpl implements ContentEntryEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void emitGenerateTopicsEvent(String userId, Long contentId, String content, String pageTitle,
            String existingTopics) {
        try {
            var payload = new ContentEntryEventPayload(
                    userId, contentId, "GENERATE", content, pageTitle, existingTopics, null);

            var key = "content-entry-" + contentId;
            var jsonPayload = objectMapper.writeValueAsString(payload);

            kafkaTemplate.send("content-entry-events", key, jsonPayload);

            log.info("Content entry event emitted for contentId: {}, action: {}", contentId, "GENERATE");

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize content entry event payload", e);
            throw new RuntimeException("Failed to emit content entry event", e);
        }
    }
}
