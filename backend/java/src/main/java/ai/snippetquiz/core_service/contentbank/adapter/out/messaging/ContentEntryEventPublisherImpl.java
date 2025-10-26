package ai.snippetquiz.core_service.contentbank.adapter.out.messaging;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryEventPayload;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryEventPublisher;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
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
    public void emitGenerateTopicsEvent(UserId userId, ContentEntryId contentId, String content, String pageTitle,
            String existingTopics) {
        try {
            var userIdString = userId.getValue().toString();
            var contentIdString = contentId.getValue().toString();
            var payload = new ContentEntryEventPayload(
                    userIdString, contentIdString, "GENERATE", content, pageTitle, existingTopics, null);

            var key = "content-entry-" + contentIdString;
            var jsonPayload = objectMapper.writeValueAsString(payload);

            kafkaTemplate.send("content-entry-events", key, jsonPayload);

            log.info("Content entry event emitted for contentId: {}, action: {}", contentId, "GENERATE");

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize content entry event payload", e);
            throw new RuntimeException("Failed to emit content entry event", e);
        }
    }
}
