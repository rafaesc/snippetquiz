package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.AllArgsConstructor;
<<<<<<< HEAD
import lombok.Builder;
=======
>>>>>>> 363c56c (feat: core service and ai processor event driven)
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

<<<<<<< HEAD
=======
import java.io.Serializable;
>>>>>>> 363c56c (feat: core service and ai processor event driven)
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AIQuestionGeneratedEvent extends IntegrationEvent {
    private Integer totalContentEntries;
    private Integer totalContentEntriesSkipped;
    private Integer currentContentEntryIndex;
    private Integer questionsGeneratedSoFar;
    private ContentEntryDto contentEntry;
    private Integer totalChunks;
    private Integer currentChunkIndex;
    private UUID bankId;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
<<<<<<< HEAD
    @Builder
=======
>>>>>>> 363c56c (feat: core service and ai processor event driven)
    public static class ContentEntryDto {
        private String id;
        private String pageTitle;
        private Integer wordCountAnalyzed;
        private List<QuestionDto> questions;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class QuestionDto {
        private String question;
        private String type;
        private List<QuestionOptionDto> options;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class QuestionOptionDto {
        private String optionText;
        private String optionExplanation;
        private Boolean isCorrect;
    }

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
            ContentEntryDto contentEntry,
            Integer totalChunks,
            Integer currentChunkIndex,
            UUID bankId) {
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
        return "ai-content-service.questions.generated";
    }

    @Override
    public AIQuestionGeneratedEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
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
<<<<<<< HEAD
                Utils.toMap(body.get("content_entry"), ContentEntryDto.class),
=======
                 Utils.toMap(body.get("content_entry"), ContentEntryDto.class),
>>>>>>> 363c56c (feat: core service and ai processor event driven)
                (Integer) body.get("total_chunks"),
                (Integer) body.get("current_chunk_index"),
                UUID.fromString((String) body.get("bank_id")));
    }
}