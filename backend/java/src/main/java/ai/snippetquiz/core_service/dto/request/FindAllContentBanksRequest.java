package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.Min;

public record FindAllContentBanksRequest(
    @Min(value = 1, message = "Page must be greater than 0")
    Integer page,
    
    @Min(value = 1, message = "Limit must be greater than 0")
    Integer limit,
    
    String name // Optional field for filtering
) {}