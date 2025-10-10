package ai.snippetquiz.core_service.quiz.application.dto.request;

import ai.snippetquiz.core_service.before.dto.request.ContentEntryDto;

import java.util.List;

public record GenerateQuizRequest(
    String instructions,
    List<ContentEntryDto> contentEntries
) {}