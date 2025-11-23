package ai.snippetquiz.core_service.quiz.application.response;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;

import java.util.List;

public record GetContentEntriesResponse(
    GenerateQuizRequest request,
    Integer entriesSkipped
) {
    public record GenerateQuizRequest(
        String instructions,
        List<ContentEntryId> newContentEntries
    ) {}
}