package ai.snippetquiz.core_service.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.Valid;

import ai.snippetquiz.core_service.dto.request.ContentEntryDto;

import java.util.List;

public record CreateQuizGenerationEventPayload(
    @NotBlank(message = "Instructions cannot be blank")
    String instructions,
    
    @NotNull(message = "Content entries cannot be null")
    @Valid
    List<ContentEntryDto> contentEntries,
    
    Integer totalContentEntriesSkipped,
    
    @NotNull(message = "Entries skipped cannot be null")
    @Positive(message = "Entries skipped must be positive or zero")
    Integer entriesSkipped,
    
    @NotBlank(message = "Quiz ID cannot be blank")
    String quizId,
    
    @NotBlank(message = "User ID cannot be blank")
    String userId,
    
    @NotNull(message = "Bank ID cannot be null")
    @Positive(message = "Bank ID must be positive")
    Integer bankId
) {}