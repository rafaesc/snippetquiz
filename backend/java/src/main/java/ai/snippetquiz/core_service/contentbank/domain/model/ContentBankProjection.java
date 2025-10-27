package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentBankProjection {
    private ContentBankId id;
    private UserId userId;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer contentEntries;
}