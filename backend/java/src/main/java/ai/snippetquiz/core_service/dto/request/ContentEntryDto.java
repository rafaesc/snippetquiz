package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ContentEntryDto(
    @NotNull(message = "Content entry ID cannot be null")
    @Positive(message = "Content entry ID must be positive")
    Long id,
    
    @NotBlank(message = "Page title cannot be blank")
    String pageTitle,
    
    @NotBlank(message = "Content cannot be blank")
    String content,
    
    @Positive(message = "Word count analyzed must be positive")
    Integer wordCountAnalyzed
) {}