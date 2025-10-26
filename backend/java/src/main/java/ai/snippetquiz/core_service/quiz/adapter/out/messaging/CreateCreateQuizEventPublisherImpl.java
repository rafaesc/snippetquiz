package ai.snippetquiz.core_service.quiz.adapter.out.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.CreateQuizGenerationEventPayload;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.CreateQuizEventPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class CreateCreateQuizEventPublisherImpl implements CreateQuizEventPublisher {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void emitCreateQuizEvent(
            CreateQuizGenerationEventPayload payload, String userId, Long quizId, UUID bankId, Integer entriesSkipped) {
        try {
            var key = "user-" + userId;
            var jsonPayload = objectMapper.writeValueAsString(payload);

            kafkaTemplate.send("create-quiz", key, jsonPayload);

            log.info("Create quiz event emitted for quizId: {}, bankId: {}, userId: {}", quizId, bankId, userId);

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize create quiz event payload", e);
            throw new RuntimeException("Failed to emit create quiz event", e);
        }
    }
}
