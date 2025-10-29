package ai.snippetquiz.core_service.contentbank.adapter.in.messaging;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryEventPayload;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

        var contentId = payload.contentId();
        var contentEntry = contentEntryRepository.findById(ContentEntryId.map(contentId))
                .orElseThrow(() -> new NotFoundException(
                        "Content Entry not found or you do not have permission to access it"));

        var existingTopics = contentEntryTopicRepository.findByContentEntryId(contentEntry.getId());
        if (!existingTopics.isEmpty()) {
            log.warn("Content entry already has topics: {}", existingTopics);
            return;
        }

        try {
            List<String> generatedTopics = payload.topics() != null ? payload.topics() : List.of();

            var topicsCreated = 0;

            var userId = UUID.fromString(payload.userId());
            List<Topic> topics = new ArrayList<>();

            for (var topicName : generatedTopics) {
                if (topicName == null || topicName.trim().isEmpty()) {
                    continue;
                }

                try {
                    var topic = topicRepository.findByUserIdAndTopic(new UserId(userId), topicName)
                            .orElseGet(() -> {
                                Topic newTopic = new Topic(userId, topicName.trim());
                                return topicRepository.save(newTopic);
                            });

                    var existingAssociations = contentEntryTopicRepository
                            .findByContentEntryId(contentEntry.getId());

                    var associationExists = existingAssociations.stream()
                            .anyMatch(cet -> cet.getTopicId().equals(topic.getId()));

                    if (!associationExists) {
                        // Create association between content entry and topic
                        var contentEntryTopic = new ContentEntryTopic(contentEntry.getId(), topic.getId());
                        contentEntryTopicRepository.save(contentEntryTopic);
                        topicsCreated++;
                        topics.add(topic);
                    }

                } catch (Exception e) {
                    log.error("Error creating topic \"{}\": ", topicName, e);
                }
            }

            contentEntry.updatedTopics(topics);

            log.info("Successfully created and linked {} topics to content entry {}",
                    topicsCreated, payload.contentId());

        } catch (Exception e) {
            log.error("Error processing SAVE event: ", e);
        }
    }
}
