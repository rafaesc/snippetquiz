package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class QuizProgressEphemeralEventTest {

    @Test
    @SuppressWarnings("unchecked")
    void roundtrip_QuizProgress() {
        UUID aggregateId = UUID.randomUUID();
        UserId userId = new UserId(UUID.randomUUID());
        UUID bankId = UUID.randomUUID();
        Integer totalContentEntries = 10;
        Integer totalContentEntriesSkipped = 2;
        Integer currentContentEntryIndex = 5;
        Integer questionsGeneratedSoFar = 15;
        Integer totalChunks = 20;
        Integer currentChunkIndex = 8;

        AIQuestionGeneratedEvent.ContentEntryDto contentEntry = AIQuestionGeneratedEvent.ContentEntryDto.builder()
                .id("entry-1")
                .pageTitle("Page Title")
                .wordCountAnalyzed(500)
                .build();

        QuizProgressEphemeralEvent original = new QuizProgressEphemeralEvent(
                aggregateId,
                userId.getValue(),
                bankId,
                totalContentEntries,
                totalContentEntriesSkipped,
                currentContentEntryIndex,
                questionsGeneratedSoFar,
                contentEntry,
                totalChunks,
                currentChunkIndex);

        HashMap<String, Object> primitives = original.toPrimitives();

        assertNotNull(primitives);
        HashMap<String, Object> progress = (HashMap<String, Object>) primitives.get("progress");
        assertNotNull(progress);

        assertEquals(aggregateId.toString(), progress.get("quizId"));
        assertEquals(bankId.toString(), progress.get("bankId"));
        assertEquals(totalContentEntries, progress.get("totalContentEntries"));
        assertEquals(totalContentEntriesSkipped, progress.get("totalContentEntriesSkipped"));
        assertEquals(currentContentEntryIndex, progress.get("currentContentEntryIndex"));
        assertEquals(questionsGeneratedSoFar, progress.get("questionsGeneratedSoFar"));
        assertEquals(totalChunks, progress.get("totalChunks"));
        assertEquals(currentChunkIndex, progress.get("currentChunkIndex"));

        HashMap<String, Object> contentEntryMap = (HashMap<String, Object>) progress.get("contentEntry");
        assertNotNull(contentEntryMap);
        assertEquals("entry-1", contentEntryMap.get("id"));
        assertEquals("Page Title", contentEntryMap.get("name"));
        assertEquals(500, contentEntryMap.get("wordCountAnalyzed"));

        assertNull(primitives.get("completed"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void toPrimitives_WithNullContentEntry() {
        QuizProgressEphemeralEvent event = new QuizProgressEphemeralEvent(
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID(),
                10, 2, 5, 15,
                null, // contentEntry is null
                20, 8);

        HashMap<String, Object> primitives = event.toPrimitives();
        HashMap<String, Object> progress = (HashMap<String, Object>) primitives.get("progress");

        assertNotNull(progress);
        assertNull(progress.get("contentEntry"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void toPrimitives_Completed_WhenTotalChunksIsZero() {
        UUID aggregateId = UUID.randomUUID();
        QuizProgressEphemeralEvent event = new QuizProgressEphemeralEvent(
                aggregateId,
                UUID.randomUUID(),
                UUID.randomUUID(),
                10, 2, 5, 15,
                null,
                0, // totalChunks is 0
                0);

        HashMap<String, Object> primitives = event.toPrimitives();

        HashMap<String, Object> completed = (HashMap<String, Object>) primitives.get("completed");
        assertNotNull(completed);
        assertEquals(aggregateId.toString(), completed.get("quizId"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void toPrimitives_Completed_WhenLastChunk() {
        UUID aggregateId = UUID.randomUUID();
        QuizProgressEphemeralEvent event = new QuizProgressEphemeralEvent(
                aggregateId,
                UUID.randomUUID(),
                UUID.randomUUID(),
                10, 2, 5, 15,
                null,
                20, // totalChunks
                19); // currentChunkIndex (0-indexed, so 19 is last)

        HashMap<String, Object> primitives = event.toPrimitives();

        HashMap<String, Object> completed = (HashMap<String, Object>) primitives.get("completed");
        assertNotNull(completed);
        assertEquals(aggregateId.toString(), completed.get("quizId"));
    }
}
