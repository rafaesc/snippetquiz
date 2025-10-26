package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentEntry {
    private ContentEntryId id;
    private UserId userId;
    private ContentType contentType;
    private String content;
    private String sourceUrl;
    private String pageTitle;
    private LocalDateTime createdAt;
    private String promptSummary;
    private Boolean questionsGenerated;
    private Integer wordCount;
    private Integer videoDuration;
    private String youtubeVideoId;
    private Long youtubeChannelId;

    public static ContentEntry create(UserId userId, ContentType type, String processedContent, String sourceUrl,
            String pageTitle) {
        var contentEntry = new ContentEntry();
        contentEntry.setUserId(userId);
        contentEntry.setContentType(type);
        contentEntry.setContent(processedContent);
        contentEntry.setSourceUrl(sourceUrl);
        contentEntry.setPageTitle(pageTitle);
        contentEntry.setQuestionsGenerated(false);

        return contentEntry;
    }
}
