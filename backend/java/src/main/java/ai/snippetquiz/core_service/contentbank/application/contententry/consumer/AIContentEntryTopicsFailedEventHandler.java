package ai.snippetquiz.core_service.contentbank.application.contententry.consumer;

import ai.snippetquiz.core_service.contentbank.application.service.ContentEntryService;
import ai.snippetquiz.core_service.contentbank.domain.events.AIContentEntryTopicsFailedIntegrationEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.CharacterMessageEphemeralEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventBus;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriberFor;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@IntegrationEventSubscriberFor({ AIContentEntryTopicsFailedIntegrationEvent.class })
public class AIContentEntryTopicsFailedEventHandler implements IntegrationEventSubscriber {

    private final ContentEntryService contentEntryService;
    private final EventBus eventBus;

    @Override
    public void on(IntegrationEvent event) {
        if (!(event instanceof AIContentEntryTopicsFailedIntegrationEvent e)) {
            log.warn("Received unexpected integration event type: {}", event.getClass().getName());
            return;
        }
        log.info("Received AIContentEntryTopicsFailedIntegrationEvent: {}", e.getAggregateId());

        try {
            var userId = new UserId(e.getUserId());
            var contentEntryId = new ContentEntryId(e.getAggregateId());

            // Delete the content entry
            contentEntryService.remove(userId, contentEntryId);
            log.info("Removed content entry {} for user {}", contentEntryId.getValue(), userId.getValue());

            // Notify user via character message
            if (e.getCharacterMessage() != null && !e.getCharacterMessage().isEmpty()) {
                eventBus.publish(CharacterMessageEphemeralEvent.eventName(), List.of(new CharacterMessageEphemeralEvent(
                        e.getAggregateId(),
                        e.getUserId(),
                        e.getCharacterMessage(),
                        e.getCharacterSpriteURL(),
                        e.getCharacterSteps(),
                        e.getCharacterAnimateTo(),
                        e.getCharacterAnimateSeconds())));
                log.info("Published CharacterMessageEphemeralEvent for failure notification");
            }

        } catch (Exception ex) {
            log.error("Error processing AIContentEntryTopicsFailedIntegrationEvent: ", ex);
        }
    }
}
