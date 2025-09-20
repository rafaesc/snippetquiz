package ai.snippetquiz.core_service.dto.event;

import ai.snippetquiz.core_service.dto.request.ContentEntryDto;

import java.util.List;

public record CreateQuizGenerationEventPayload(
            String instructions,
            List<ContentEntryDto> contentEntries,
            Integer entriesSkipped,
            String quizId,
            String userId,
            Long bankId) {}