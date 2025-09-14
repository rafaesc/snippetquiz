package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

import java.util.List;

public record GenerateQuizRequest(
    @NotBlank(message = "Instructions cannot be blank")
    String instructions,
    
    @NotNull(message = "Content entries cannot be null")
    @Valid
    List<ContentEntryDto> contentEntries
) {}