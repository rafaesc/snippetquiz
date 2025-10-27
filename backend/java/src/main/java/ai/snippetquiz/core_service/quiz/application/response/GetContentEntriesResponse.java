package ai.snippetquiz.core_service.quiz.application.response;

import java.util.List;

public record GetContentEntriesResponse(
    GenerateQuizRequest request,
    Integer entriesSkipped
) {
    public record GenerateQuizRequest(
        String instructions,
        List<ContentEntryDto> contentEntries
    ) {}
    
    public record ContentEntryDto(
        String id,
        String pageTitle,
        String content,
        Integer wordCountAnalyzed
    ) {}
}