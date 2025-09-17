package ai.snippetquiz.core_service.consumer;

import ai.snippetquiz.core_service.entity.ContentEntry;
import ai.snippetquiz.core_service.entity.ContentEntryTopic;
import ai.snippetquiz.core_service.entity.Topic;
import ai.snippetquiz.core_service.repository.ContentEntryRepository;
import ai.snippetquiz.core_service.repository.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.repository.TopicRepository;
import ai.snippetquiz.core_service.service.KafkaProducerService.ContentEntryEventPayload;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
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
            ContentEntryEventPayload payload = objectMapper.readValue(message, ContentEntryEventPayload.class);            
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

            int topicsCreated = 0;

            // Get the content entry to link topics to
            Long contentId = Long.parseLong(payload.contentId());
            Optional<ContentEntry> contentEntryOpt = contentEntryRepository.findById(contentId);

            if (contentEntryOpt.isEmpty()) {
                log.error("Content entry not found: {}", payload.contentId());
                return;
            }

            ContentEntry contentEntry = contentEntryOpt.get();
            UUID userId = UUID.fromString(payload.userId());

            // Process each generated topic
            for (String topicName : generatedTopics) {
                if (topicName == null || topicName.trim().isEmpty()) {
                    continue;
                }

                try {
                    // Find or create topic
                    Topic topic = topicRepository.findByUserIdAndTopic(userId, topicName)
                            .orElseGet(() -> {
                                Topic newTopic = new Topic(userId, topicName.trim());
                                return topicRepository.save(newTopic);
                            });

                    // Check if association already exists
                    List<ContentEntryTopic> existingAssociations = contentEntryTopicRepository
                            .findByContentEntryId(contentEntry.getId());

                    boolean associationExists = existingAssociations.stream()
                            .anyMatch(cet -> cet.getTopic().getId().equals(topic.getId()));

                    if (!associationExists) {
                        // Create association between content entry and topic
                        ContentEntryTopic contentEntryTopic = new ContentEntryTopic(contentEntry, topic);
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
