package ai.snippetquiz.core_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class FindAllContentBanksRequest extends PaginationRequest {
    private String name;
}