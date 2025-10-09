package ai.snippetquiz.core_service.contentbank.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentEntryBank {
    private Long id;
    private ContentEntry contentEntry;
    private ContentBank contentBank;
}
