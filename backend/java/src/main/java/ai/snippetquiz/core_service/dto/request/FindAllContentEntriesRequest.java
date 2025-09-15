package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FindAllContentEntriesRequest extends PaginationRequest {
    
    private String name;
    
    @NotBlank(message = "Bank ID is required")
    private String bankId;
}