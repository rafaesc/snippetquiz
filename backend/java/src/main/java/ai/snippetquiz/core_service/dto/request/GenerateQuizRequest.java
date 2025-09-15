package ai.snippetquiz.core_service.dto.request;

import java.util.List;

public record GenerateQuizRequest(
    String instructions,
    List<ContentEntryDto> contentEntries
) {}