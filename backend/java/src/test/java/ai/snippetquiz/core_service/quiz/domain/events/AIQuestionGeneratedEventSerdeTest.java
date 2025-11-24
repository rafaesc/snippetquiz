package ai.snippetquiz.core_service.quiz.domain.events;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventsInformation;
import org.junit.jupiter.api.Test;

import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AIQuestionGeneratedEventSerdeTest {

    @Test
    void deserialize_reconstructs_integration_event() throws Exception {
        UUID aggregateId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        String occurredOn = "2024-01-01T00:00:00";
        int version = 0;
        UUID bankId = UUID.randomUUID();

        HashMap<String, Serializable> contentEntry = new HashMap<>();
        contentEntry.put("id", UUID.randomUUID().toString());
        contentEntry.put("pageTitle", "Page Title");
        contentEntry.put("wordCountAnalyzed", 100);

        HashMap<String, Serializable> question = new HashMap<>();
        question.put("question", "What is Java?");
        question.put("type", "MCQ");

        HashMap<String, Serializable> option = new HashMap<>();
        option.put("optionText", "A programming language");
        option.put("optionExplanation", "Java is widely used.");
        option.put("isCorrect", true);

        List<HashMap<String, Serializable>> options = List.of(option);
        question.put("options", (Serializable) options);

        List<HashMap<String, Serializable>> questions = List.of(question);
        contentEntry.put("questions", (Serializable) questions);

        HashMap<String, Object> attributes = new HashMap<>();
        attributes.put("aggregate_id", aggregateId.toString());
        attributes.put("user_id", userId.toString());
        attributes.put("total_content_entries", 1);
        attributes.put("total_content_entries_skipped", 0);
        attributes.put("current_content_entry_index", 0);
        attributes.put("questions_generated_so_far", 0);
        attributes.put("content_entry", contentEntry);
        attributes.put("total_chunks", 1);
        attributes.put("current_chunk_index", 0);
        attributes.put("bank_id", bankId.toString());

        HashMap<String, Serializable> data = new HashMap<>();
        data.put("event_id", eventId.toString());
        data.put("version", version);
        data.put("type", Utils.getEventName(AIQuestionGeneratedEvent.class));
        data.put("occurred_on", occurredOn);
        data.put("attributes", attributes);

        HashMap<String, Serializable> root = new HashMap<>();
        root.put("data", data);
        root.put("meta", new HashMap<>());

        String json = Utils.toJson(root);

        EventsInformation info = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(info);

        var result = deserializer.deserialize(json);

        assertNotNull(result);
        assertInstanceOf(AIQuestionGeneratedEvent.class, result);
        var reconstructed = (AIQuestionGeneratedEvent) result;
        assertEquals(aggregateId, reconstructed.getAggregateId());
        assertEquals(userId, reconstructed.getUserId());
        assertEquals(eventId, reconstructed.getEventId());
        assertEquals(occurredOn, reconstructed.getOccurredOn());
        assertEquals(bankId, reconstructed.getBankId());
        assertEquals(1, reconstructed.getTotalContentEntries());
        assertEquals(0, reconstructed.getTotalContentEntriesSkipped());
        assertEquals(0, reconstructed.getCurrentContentEntryIndex());
        assertEquals(0, reconstructed.getQuestionsGeneratedSoFar());
        assertNotNull(reconstructed.getContentEntry());
        assertEquals(1, reconstructed.getTotalChunks());
        assertEquals(0, reconstructed.getCurrentChunkIndex());
    }
}
