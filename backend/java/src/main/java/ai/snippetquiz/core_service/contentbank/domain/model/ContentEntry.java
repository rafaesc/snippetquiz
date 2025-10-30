package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryTopicAddedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@JsonSerialize
public class ContentEntry extends AggregateRoot<ContentEntryId> {
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

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static ContentEntry create(UserId userId, ContentType type, String processedContent, String sourceUrl,
            String pageTitle, Integer youtubeVideoDuration, String youtubeVideoId, YoutubeChannel youtubeChannel) {
        var now = LocalDateTime.now();
        var contentEntry = new ContentEntry();
        contentEntry.setUserId(userId);
        contentEntry.setContentType(type);
        contentEntry.setContent(processedContent);
        contentEntry.setSourceUrl(sourceUrl);
        contentEntry.setPageTitle(pageTitle);
        contentEntry.setCreatedAt(now);
        contentEntry.setQuestionsGenerated(false);

        Integer wordCount = null;

        // Calculate word count for selected_text and full_html content types
        if ((ContentType.SELECTED_TEXT.equals(type) || ContentType.FULL_HTML.equals(type))
                && Objects.nonNull(processedContent)
                && !processedContent.trim().isEmpty()) {
            var words = processedContent.trim().split("\\s+");
            wordCount = (int) Arrays.stream(words).filter(word -> !word.isEmpty()).count();
            contentEntry.setWordCount(wordCount);
        }

        // Add YouTube fields for VIDEO_TRANSCRIPT type
        if (ContentType.VIDEO_TRANSCRIPT.equals(type)) {
            if (Objects.nonNull(youtubeVideoId)) {
                contentEntry.setYoutubeVideoId(youtubeVideoId);
            }
            if (Objects.nonNull(youtubeVideoDuration)) {
                contentEntry.setVideoDuration(youtubeVideoDuration);
            }
            if (Objects.nonNull(youtubeChannel)) {
                contentEntry.setYoutubeChannelId(youtubeChannel.getId().getValue());
            }
        }

        contentEntry.record(new ContentEntryCreatedDomainEvent(
                contentEntry.getId().toString(),
                userId.toString(),
                type.toString(),
                processedContent,
                sourceUrl,
                pageTitle,
                Utils.dateToString(now),
                wordCount,
                youtubeVideoDuration,
                youtubeVideoId,
                youtubeChannel.getChannelName()));

        return contentEntry;
    }

    public void update(String content, String pageTitle) {
        var now = LocalDateTime.now();
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = now;

        if (Objects.nonNull(content) && !content.trim().isEmpty()) {
            int wordCount = content.trim().split("\\s+").length;
            this.wordCount = wordCount;
        }

        record(new ContentEntryUpdatedDomainEvent(
                getId().toString(),
                userId.toString(),
                content,
                pageTitle,
                Utils.dateToString(now),
                wordCount));
    }

    public void updatedTopics(List<Topic> topics) {
        var now = LocalDateTime.now();
        record(new ContentEntryTopicAddedDomainEvent(
            getId().toString(),
            userId.toString(),
            Topic.toJson(new HashSet<>(topics)),
            Utils.dateToString(now)));
    }

    public static String toJson(Set<ContentEntry> entries) {
        try {
            return objectMapper.writeValueAsString(entries);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing ContentEntry list", e);
        }
    }
}
