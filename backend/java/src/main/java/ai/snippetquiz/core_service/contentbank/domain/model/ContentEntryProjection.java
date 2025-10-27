package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntryProjection {
    private ContentEntryId id;
    private UserId userId;
    private ContentType contentType;
    private String content;
    private String sourceUrl;
    private String pageTitle;
    private LocalDateTime createdAt;
    private Boolean questionsGenerated;
    private String topics;
    private ContentBankId contentBankId;
}