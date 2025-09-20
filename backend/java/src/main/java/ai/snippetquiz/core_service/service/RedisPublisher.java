package ai.snippetquiz.core_service.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.dto.event.QuizGenerationEventPayload;
import ai.snippetquiz.core_service.dto.event.QuizGenerationFanoutEventPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisPublisher {
    private final RedisTemplate<String, Object> redisTemplate;

    public void sendFanoutMessageQuizGenerationEvent(String userId, QuizGenerationEventPayload event) {
        if (!event.userId().equals(userId)) {
            return;
        }

        String channel = "quiz-generation:user-id:" + userId;

        if (event.totalChunks() == 0 || event.currentChunkIndex() + 1 == event.totalChunks()) {
            // Quiz completed - send completion message
            log.info(
                    "Quiz completed message published for user: {}, quizId: {}, totalChunks: {}, currentChunkIndex: {}",
                    userId,
                    event.quizId(), event.totalChunks(), event.currentChunkIndex());

            QuizGenerationFanoutEventPayload completedPayload = QuizGenerationFanoutEventPayload.builder()
                    .completed(QuizGenerationFanoutEventPayload.Completed.builder()
                            .quizId(event.quizId())
                            .build())
                    .progress(QuizGenerationFanoutEventPayload.Progress.builder()
                            .quizId(event.quizId())
                            .bankId(event.bankId())
                            .totalContentEntries(event.totalContentEntries())
                            .totalChunks(event.totalChunks())
                            .currentChunkIndex(event.currentChunkIndex())
                            .build())
                    .build();
            redisTemplate.convertAndSend(channel, completedPayload);
            return;
        }

        QuizGenerationFanoutEventPayload progressPayload = QuizGenerationFanoutEventPayload.builder()
                .progress(QuizGenerationFanoutEventPayload.Progress.builder()
                        .quizId(event.quizId())
                        .bankId(event.bankId())
                        .totalContentEntries(event.totalContentEntries())
                        .totalContentEntriesSkipped(event.totalContentEntriesSkipped())
                        .currentContentEntryIndex(event.currentContentEntryIndex())
                        .questionsGeneratedSoFar(event.questionsGeneratedSoFar())
                        .contentEntry(QuizGenerationFanoutEventPayload.Progress.ContentEntry.builder()
                                .id(event.contentEntry().id().toString())
                                .name(event.contentEntry().pageTitle())
                                .wordCountAnalyzed(event.contentEntry().wordCountAnalyzed())
                                .build())
                        .totalChunks(event.totalChunks())
                        .currentChunkIndex(event.currentChunkIndex())
                        .build())
                .build();

        redisTemplate.convertAndSend(channel, progressPayload);
        log.info("Quiz progress message published for user: {}, progress: {}/{}",
                userId, event.currentChunkIndex() + 1, event.totalChunks());
    }
}
