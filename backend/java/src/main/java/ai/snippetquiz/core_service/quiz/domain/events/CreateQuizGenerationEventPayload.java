package ai.snippetquiz.core_service.quiz.domain.events;

import java.util.List;
import java.util.UUID;

public record CreateQuizGenerationEventPayload(
            String instructions,
            List<ContentEntryEvent> contentEntries,
            Integer entriesSkipped,
            Long quizId,
            String userId,
            UUID bankId) {
    public record ContentEntryEvent(
            String id,
            String pageTitle,
            String content,
            Integer wordCountAnalyzed
    ) {}
}