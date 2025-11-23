package ai.snippetquiz.core_service.contentbank.application.contententry.consumer;

import ai.snippetquiz.core_service.contentbank.domain.events.TopicsAddedIntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriberFor;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.shared.exception.NotFoundException;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
@IntegrationEventSubscriberFor({TopicsAddedIntegrationEvent.class})
public class TopicsAddedIntegrationEventConsumer implements IntegrationEventSubscriber {

    private final TopicRepository topicRepository;
    private final ContentEntryRepository contentEntryRepository;
    private final ContentEntryTopicRepository contentEntryTopicRepository;

    @Override
    public void on(IntegrationEvent event) {
        if (!(event instanceof TopicsAddedIntegrationEvent e)) {
            log.warn("Received unexpected integration event type: {}", event.getClass().getName());
            return;
        }
        log.info("Received TopicsAddedIntegrationEvent: {}", e.getAggregateId());

        try {
            var contentId = e.getAggregateId();
            var contentEntry = contentEntryRepository.findById(new ContentEntryId(contentId))
                    .orElseThrow(() -> new NotFoundException(
                            "Content Entry not found or you do not have permission to access it"));

            var existingTopics = contentEntryTopicRepository.findByContentEntryId(contentEntry.getId());
            if (!existingTopics.isEmpty()) {
                log.warn("Content entry already has topics: {}", existingTopics);
                return;
            }

            List<String> generatedTopics = Objects.nonNull(e.getTopics()) ? e.getTopics() : java.util.List.of();
            var topicsCreated = 0;
            var userId = new UserId(event.getUserId());
            java.util.List<Topic> topics = new java.util.ArrayList<>();

            for (var topicName : generatedTopics) {
                if (topicName == null || topicName.trim().isEmpty()) {
                    continue;
                }

                try {
                    var topic = topicRepository.findByUserIdAndTopic(userId, topicName)
                            .orElseGet(() -> topicRepository.save(new Topic(userId, topicName.trim())));

                    var existingAssociations = contentEntryTopicRepository
                            .findByContentEntryId(contentEntry.getId());

                    var associationExists = existingAssociations.stream()
                            .anyMatch(cet -> cet.getTopicId().equals(topic.getId()));

                    if (!associationExists) {
                        var contentEntryTopic = new ContentEntryTopic(contentEntry.getId(), topic.getId());
                        contentEntryTopicRepository.save(contentEntryTopic);
                        topicsCreated++;
                        topics.add(topic);
                    }

                } catch (Exception ex) {
                    log.error("Error creating topic \"{}\": ", topicName, ex);
                }
            }

            contentEntry.updatedTopics(topics);
            log.info("Successfully created and linked {} topics to content entry {}",
                    topicsCreated, contentId);

        } catch (Exception ex) {
            log.error("Error processing TopicsAddedIntegrationEvent: ", ex);
        }
    }
}