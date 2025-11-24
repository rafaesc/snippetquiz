package ai.snippetquiz.core_service.contentbank.application.contentbank.consumer;

import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.contentbank.domain.events.AuthUserVerifiedIntegrationEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriberFor;
import ai.snippetquiz.core_service.shared.domain.port.repository.EventProcessedRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@IntegrationEventSubscriberFor({ AuthUserVerifiedIntegrationEvent.class })
public class AuthUserVerifiedEventHandler implements IntegrationEventSubscriber {

    private final EventProcessedRepository eventProcessedRepository;
    private final ContentBankService contentBankService;

    @Override
    public void on(IntegrationEvent event) {
        if (!(event instanceof AuthUserVerifiedIntegrationEvent e)) {
            log.warn("Received unexpected integration event type: {}", event.getClass().getName());
            return;
        }

        if (eventProcessedRepository.isEventProcessed(e.getEventId())) {
            log.info("Event {} already processed", e.getEventId());
            return;
        }

        log.info("Received AuthUserVerifiedIntegrationEvent: {}", e.getAggregateId());

        contentBankService.create(new ContentBankId(UUID.randomUUID()), new UserId(e.getAggregateId()),
                "Default");

        eventProcessedRepository.save(e);
    }
}
