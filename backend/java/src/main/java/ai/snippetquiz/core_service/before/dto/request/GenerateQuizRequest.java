package ai.snippetquiz.core_service.before.dto.request;

import java.util.List;

public record GenerateQuizRequest(
    String instructions,
    List<ContentEntryDto> contentEntries
) {}