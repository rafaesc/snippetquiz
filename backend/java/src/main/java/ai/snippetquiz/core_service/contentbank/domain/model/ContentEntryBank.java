package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryBankId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class ContentEntryBank extends BaseEntity<ContentEntryBankId> {
    private ContentEntry contentEntry;
    private ContentBank contentBank;
}
