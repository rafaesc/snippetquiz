package ai.snippetquiz.core_service.dto.response;

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
        Long id,
        String pageTitle,
        String content,
        Integer wordCountAnalyzed
    ) {}
}