package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.EphemeralEvent;
import lombok.Getter;
import java.util.HashMap;
import java.util.UUID;

@Getter
public class QuizProgressEphemeralEvent extends EphemeralEvent {
    private final UUID bankId;
    private final Integer totalContentEntries;
    private final Integer totalContentEntriesSkipped;
    private final Integer currentContentEntryIndex;
    private final Integer questionsGeneratedSoFar;
    private final AIQuestionGeneratedEvent.ContentEntryDto contentEntry;
    private final Integer totalChunks;
    private final Integer currentChunkIndex;

    public QuizProgressEphemeralEvent(
            UUID aggregateId,
            UUID userId,
            UUID bankId,
            Integer totalContentEntries,
            Integer totalContentEntriesSkipped,
            Integer currentContentEntryIndex,
            Integer questionsGeneratedSoFar,
            AIQuestionGeneratedEvent.ContentEntryDto contentEntry,
            Integer totalChunks,
            Integer currentChunkIndex) {
        super(aggregateId, userId);
        this.bankId = bankId;
        this.totalContentEntries = totalContentEntries;
        this.totalContentEntriesSkipped = totalContentEntriesSkipped;
        this.currentContentEntryIndex = currentContentEntryIndex;
        this.questionsGeneratedSoFar = questionsGeneratedSoFar;
        this.contentEntry = contentEntry;
        this.totalChunks = totalChunks;
        this.currentChunkIndex = currentChunkIndex;
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        HashMap<String, Object> primitives = new HashMap<>();
        HashMap<String, Object> progress = new HashMap<>();

        progress.put("quizId", this.getAggregateId().toString());
        progress.put("bankId", this.bankId.toString());
        progress.put("totalContentEntries", this.totalContentEntries);
        progress.put("totalContentEntriesSkipped", this.totalContentEntriesSkipped);
        progress.put("currentContentEntryIndex", this.currentContentEntryIndex);
        progress.put("questionsGeneratedSoFar", this.questionsGeneratedSoFar);
        progress.put("totalChunks", this.totalChunks);
        progress.put("currentChunkIndex", this.currentChunkIndex);

        if (this.contentEntry != null) {
            HashMap<String, Object> entry = new HashMap<>();
            entry.put("id", this.contentEntry.getId());
            entry.put("name", this.contentEntry.getPageTitle());
            entry.put("wordCountAnalyzed", this.contentEntry.getWordCountAnalyzed());
            progress.put("contentEntry", entry);
        }

        primitives.put("progress", progress);

        if (this.totalChunks == 0 || this.currentChunkIndex + 1 == this.totalChunks) {
            HashMap<String, Object> completed = new HashMap<>();
            completed.put("quizId", this.getAggregateId().toString());
            primitives.put("completed", completed);
        }

        return primitives;
    }

    public static String eventName() {
        return "quiz.progress.ephemeral";
    }
}
