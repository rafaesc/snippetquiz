package ai.snippetquiz.core_service.question.application.dto;

import java.util.List;

public record CreateQuestionRequest(
    Long contentEntryId,
    String question,
    Integer questionIndexInChunk,
    Integer currentChunkIndex,
    List<QuestionOptionRequest> options
) {}