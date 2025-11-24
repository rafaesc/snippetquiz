package ai.snippetquiz.core_service.contentbank.application.contentbank.consumer;

import ai.snippetquiz.core_service.contentbank.application.service.ContentBankService;
import ai.snippetquiz.core_service.contentbank.domain.events.AuthUserVerifiedIntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.port.repository.EventProcessedRepository;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthUserVerifiedEventHandlerTest {

    @Mock
    private EventProcessedRepository eventProcessedRepository;
    @Mock
    private ContentBankService contentBankService;

    @InjectMocks
    private AuthUserVerifiedEventHandler handler;

    @Test
    void onAuthUserVerified_createsDefaultContentBankAndSavesEvent() {
        UUID aggregateId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        AuthUserVerifiedIntegrationEvent event = new AuthUserVerifiedIntegrationEvent(
                aggregateId,
                eventId,
                "2024-01-01T00:00:00",
                0);

        when(eventProcessedRepository.isEventProcessed(eventId)).thenReturn(false);

        handler.on(event);

        verify(contentBankService).create(any(), eq(new UserId(aggregateId)), eq("Default"));
        verify(eventProcessedRepository).save(event);
    }

    @Test
    void onAuthUserVerified_whenEventProcessed_doesNothing() {
        UUID aggregateId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        AuthUserVerifiedIntegrationEvent event = new AuthUserVerifiedIntegrationEvent(
                aggregateId,
                eventId,
                "2024-01-01T00:00:00",
                0);

        when(eventProcessedRepository.isEventProcessed(eventId)).thenReturn(true);

        handler.on(event);

        verify(contentBankService, never()).create(any(), any(), any());
        verify(eventProcessedRepository, never()).save(any());
    }
}
