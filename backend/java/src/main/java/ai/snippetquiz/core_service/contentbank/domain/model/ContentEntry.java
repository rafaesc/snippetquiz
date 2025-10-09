package ai.snippetquiz.core_service.contentbank.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentEntry {
    private Long id;
    private UUID userId;
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
    private YoutubeChannel youtubeChannel;
    private List<ContentEntryBank> contentEntryBanks;
    private List<ContentEntryTopic> contentEntryTopics;
}
