package ai.snippetquiz.core_service.contentbank.application.contententry.consumer;

import ai.snippetquiz.core_service.contentbank.domain.events.AITopicsAddedIntegrationEvent;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntry;
import ai.snippetquiz.core_service.contentbank.domain.model.ContentEntryTopic;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryRepository;
import ai.snippetquiz.core_service.contentbank.domain.port.ContentEntryTopicRepository;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;
import ai.snippetquiz.core_service.topic.domain.port.TopicRepository;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AIAITopicsAddedEventHandlerTest {

    @Mock
    private TopicRepository topicRepository;
    @Mock
    private ContentEntryRepository contentEntryRepository;
    @Mock
    private ContentEntryTopicRepository contentEntryTopicRepository;

    @InjectMocks
    private AITopicsAddedEventHandler consumer;

    @Test
    void onTopicsAdded_createsTopicsAndAssociations() {
        UUID contentId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        List<String> topics = List.of("java", "spring");

        AITopicsAddedIntegrationEvent event = new AITopicsAddedIntegrationEvent(
                contentId,
                userId,
                UUID.randomUUID(),
                "2024-01-01T00:00:00",
                0,
                topics,
                "",
                "",
                0,
                0,
                0);

        ContentEntry entry = new ContentEntry();
        entry.setId(new ContentEntryId(contentId));
        entry.setUserId(userId);

        when(contentEntryRepository.findById(any())).thenReturn(Optional.of(entry));
        when(contentEntryTopicRepository.findByContentEntryId(eq(entry.getId()))).thenReturn(new ArrayList<>());

        when(topicRepository.findByUserIdAndTopic(eq(userId), eq("java"))).thenReturn(Optional.empty());
        when(topicRepository.findByUserIdAndTopic(eq(userId), eq("spring"))).thenReturn(Optional.empty());
        when(topicRepository.save(any())).thenAnswer(invocation -> {
            Topic t = invocation.getArgument(0);
            t.setId(new TopicId(1L));
            return t;
        });

        when(contentEntryTopicRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        consumer.on(event);

        verify(topicRepository, times(2)).save(any());
        verify(contentEntryRepository, times(1)).save(any());
        verify(contentEntryTopicRepository, times(2)).save(any(ContentEntryTopic.class));
        assertNotNull(entry.getId());
    }
}