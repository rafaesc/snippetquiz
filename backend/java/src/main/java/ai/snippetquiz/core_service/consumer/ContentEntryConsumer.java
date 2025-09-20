package ai.snippetquiz.core_service.consumer;

import ai.snippetquiz.core_service.dto.event.ContentEntryEventPayload;
import ai.snippetquiz.core_service.entity.ContentEntryTopic;
import ai.snippetquiz.core_service.entity.Topic;
import ai.snippetquiz.core_service.repository.ContentEntryRepository;
import ai.snippetquiz.core_service.repository.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.repository.TopicRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class ContentEntryConsumer {

    private final ContentEntryRepository contentEntryRepository;
    private final TopicRepository topicRepository;
    private final ContentEntryTopicRepository contentEntryTopicRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "content-entry-events", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void consume(String message) {
        try {
            var payload = objectMapper.readValue(message, ContentEntryEventPayload.class);
            if ("SAVE".equals(payload.action())) {
                handleSaveEvent(payload);
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to parse content entry event message: {}", message, e);
        } catch (Exception e) {
            log.error("Failed to process content-entry event", e);
        }
    }

    private void handleSaveEvent(ContentEntryEventPayload payload) {
        log.info("Processing SAVE event for content ID: {} - topics count: {}",
                payload.contentId(),
                payload.topics() != null ? payload.topics().size() : 0);

        try {
            List<String> generatedTopics = payload.topics() != null ? payload.topics() : List.of();

            var topicsCreated = 0;

            var contentId = Long.parseLong(payload.contentId());
            var contentEntryOpt = contentEntryRepository.findById(contentId);

            if (contentEntryOpt.isEmpty()) {
                log.error("Content entry not found: {}", payload.contentId());
                return;
            }

            var contentEntry = contentEntryOpt.get();
            var userId = UUID.fromString(payload.userId());

            for (var topicName : generatedTopics) {
                if (topicName == null || topicName.trim().isEmpty()) {
                    continue;
                }

                try {
                    var topic = topicRepository.findByUserIdAndTopic(userId, topicName)
                            .orElseGet(() -> {
                                Topic newTopic = new Topic(userId, topicName.trim());
                                return topicRepository.save(newTopic);
                            });

                    var existingAssociations = contentEntryTopicRepository
                            .findByContentEntryId(contentEntry.getId());

                    var associationExists = existingAssociations.stream()
                            .anyMatch(cet -> cet.getTopic().getId().equals(topic.getId()));

                    if (!associationExists) {
                        // Create association between content entry and topic
                        var contentEntryTopic = new ContentEntryTopic(contentEntry, topic);
                        contentEntryTopicRepository.save(contentEntryTopic);
                        topicsCreated++;
                    }

                } catch (Exception e) {
                    log.error("Error creating topic \"{}\": ", topicName, e);
                }
            }

            log.info("Successfully created and linked {} topics to content entry {}",
                    topicsCreated, payload.contentId());

        } catch (Exception e) {
            log.error("Error processing SAVE event: ", e);
        }
    }
}
