package ai.snippetquiz.core_service.dto.event;

import java.util.List;

public record QuizGenerationEventPayload(
    Long quizId,
    Long bankId,
    String userId,
    Integer totalContentEntries,
    Integer totalContentEntriesSkipped,
    Integer currentContentEntryIndex,
    Integer questionsGeneratedSoFar,
    ContentEntryDto contentEntry,
    Integer totalChunks,
    Integer currentChunkIndex
) {
    public record ContentEntryDto(
        Long id,
        String pageTitle,
        Integer wordCountAnalyzed,
        List<QuestionDto> questions
    ) {}
    
    public record QuestionDto(
        String question,
        String type,
        List<QuestionOptionDto> options
    ) {}
    
    public record QuestionOptionDto(
        String optionText,
        String optionExplanation,
        Boolean isCorrect
    ) {}
}