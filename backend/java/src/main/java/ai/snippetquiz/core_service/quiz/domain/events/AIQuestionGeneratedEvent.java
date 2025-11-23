package ai.snippetquiz.core_service.quiz.domain.events;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

import com.fasterxml.jackson.core.type.TypeReference;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AIQuestionGeneratedEvent extends IntegrationEvent {
    private Integer totalContentEntries;
    private Integer totalContentEntriesSkipped;
    private Integer currentContentEntryIndex;
    private Integer questionsGeneratedSoFar;
    private QuizGenerationEventPayload.ContentEntryDto contentEntry;
    private Integer totalChunks;
    private Integer currentChunkIndex;
    private UUID bankId;

    public AIQuestionGeneratedEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            Integer totalContentEntries,
            Integer totalContentEntriesSkipped,
            Integer currentContentEntryIndex,
            Integer questionsGeneratedSoFar,
            QuizGenerationEventPayload.ContentEntryDto contentEntry,
            Integer totalChunks,
            Integer currentChunkIndex,
            UUID bankId
    ) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.totalContentEntries = totalContentEntries;
        this.totalContentEntriesSkipped = totalContentEntriesSkipped;
        this.currentContentEntryIndex = currentContentEntryIndex;
        this.questionsGeneratedSoFar = questionsGeneratedSoFar;
        this.contentEntry = contentEntry;
        this.totalChunks = totalChunks;
        this.currentChunkIndex = currentChunkIndex;
        this.bankId = bankId;
    }

    public static String eventName() {
        return "ai-processor.questions.generated";
    }

    @Override
    public AIQuestionGeneratedEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            Integer version
    ) {
        return new AIQuestionGeneratedEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (Integer) body.get("total_content_entries"),
                (Integer) body.get("total_content_entries_skipped"),
                (Integer) body.get("current_content_entry_index"),
                (Integer) body.get("questions_generated_so_far"),
                Utils.fromJson((String) body.get("content_entry"),
                        new TypeReference<QuizGenerationEventPayload.ContentEntryDto>() {}),
                (Integer) body.get("total_chunks"),
                (Integer) body.get("current_chunk_index"),
                UUID.fromString((String) body.get("bank_id"))
        );
    }
}