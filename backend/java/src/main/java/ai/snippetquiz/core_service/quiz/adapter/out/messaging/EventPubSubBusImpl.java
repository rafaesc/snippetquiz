package ai.snippetquiz.core_service.quiz.adapter.out.messaging;

import ai.snippetquiz.core_service.quiz.domain.events.AIQuestionGeneratedEvent;
import ai.snippetquiz.core_service.quiz.domain.events.QuizGenerationEventPubSub;
import ai.snippetquiz.core_service.quiz.domain.port.messaging.EventPubSubBus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPubSubBusImpl implements EventPubSubBus {
    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(AIQuestionGeneratedEvent event) {
        UUID userId = event.getUserId();
        String channel = "quiz-generation:user-id:" + userId;

        if (event.getTotalChunks() == 0 || event.getCurrentChunkIndex() + 1 == event.getTotalChunks()) {
            // Quiz completed - send completion message
            log.info(
                    "Quiz completed message published for user: {}, quizId: {}, totalChunks: {}, currentChunkIndex: {}",
                    userId,
                    event.getAggregateId(), event.getTotalChunks(), event.getCurrentChunkIndex());

            var completedPayload = QuizGenerationEventPubSub.builder()
                    .completed(QuizGenerationEventPubSub.Completed.builder()
                            .quizId(event.getAggregateId().toString())
                            .build())
                    .progress(QuizGenerationEventPubSub.Progress.builder()
                            .quizId(event.getAggregateId().toString())
                            .bankId(event.getBankId().toString())
                            .totalContentEntries(event.getTotalContentEntries())
                            .totalChunks(event.getTotalChunks())
                            .currentChunkIndex(event.getCurrentChunkIndex())
                            .build())
                    .build();
            redisTemplate.convertAndSend(channel, completedPayload);
            return;
        }

        var progressPayload = QuizGenerationEventPubSub.builder()
                .progress(QuizGenerationEventPubSub.Progress.builder()
                        .quizId(event.getAggregateId().toString())
                        .bankId(event.getBankId().toString())
                        .totalContentEntries(event.getTotalContentEntries())
                        .totalContentEntriesSkipped(event.getTotalContentEntriesSkipped())
                        .currentContentEntryIndex(event.getCurrentContentEntryIndex())
                        .questionsGeneratedSoFar(event.getQuestionsGeneratedSoFar())
                        .contentEntry(QuizGenerationEventPubSub.Progress.ContentEntry.builder()
                                .id(event.getContentEntry().getId())
                                .name(event.getContentEntry().getPageTitle())
                                .wordCountAnalyzed(event.getContentEntry().getWordCountAnalyzed())
                                .build())
                        .totalChunks(event.getTotalChunks())
                        .currentChunkIndex(event.getCurrentChunkIndex())
                        .build())
                .build();

        redisTemplate.convertAndSend(channel, progressPayload);
        log.info("Quiz progress message published for user: {}, progress: {}/{}",
                userId, event.getCurrentChunkIndex() + 1, event.getTotalChunks());
    }
}
