package ai.snippetquiz.core_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class FindAllContentBanksRequest extends PaginationRequest {
    private String name;
}