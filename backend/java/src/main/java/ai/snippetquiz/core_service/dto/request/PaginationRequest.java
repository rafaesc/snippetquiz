package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public abstract class PaginationRequest {
    @Min(value = 1, message = "Page must be greater than 0")
    private Integer page;
    
    @Min(value = 1, message = "Limit must be greater than 0")
    private Integer limit;
}