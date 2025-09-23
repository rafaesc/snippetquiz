package ai.snippetquiz.core_service.dto.request;

import java.util.List;

public record CreateQuestionRequest(
    Long contentEntryId,
    String question,
    Integer questionIndexInChunk,
    Integer currentChunkIndex,
    List<QuestionOptionRequest> options
) {}