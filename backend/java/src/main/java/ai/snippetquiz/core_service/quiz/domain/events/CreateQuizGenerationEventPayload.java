package ai.snippetquiz.core_service.quiz.domain.events;

import java.util.List;

public record CreateQuizGenerationEventPayload(
            String instructions,
            List<ContentEntryEvent> contentEntries,
            Integer entriesSkipped,
            Long quizId,
            String userId,
            Long bankId) {
    public record ContentEntryEvent(
            Long id,
            String pageTitle,
            String content,
            Integer wordCountAnalyzed
    ) {}
}