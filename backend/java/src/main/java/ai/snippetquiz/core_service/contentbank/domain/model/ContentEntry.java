package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryDeletedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryTopicAddedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.YoutubeChannelId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonSerialize
@NoArgsConstructor
public class ContentEntry extends AggregateRoot<ContentEntryId> {
    private UserId userId;
    private ContentBankId contentBankId;
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
    private YoutubeChannelId youtubeChannelId;

    public ContentEntry(UserId userId, ContentBankId contentBankId, ContentType type, String processedContent, String sourceUrl,
            String pageTitle, Integer youtubeVideoDuration, String youtubeVideoId, 
            YoutubeChannel youtubeChannel) {
        var contentEntryId = UUID.randomUUID();
        var now = LocalDateTime.now();
        Integer wordCount = null;

        // Calculate word count for selected_text and full_html content types
        if ((ContentType.SELECTED_TEXT.equals(type) || ContentType.FULL_HTML.equals(type))
                && Objects.nonNull(processedContent)
                && !processedContent.trim().isEmpty()) {
            var words = processedContent.trim().split("\\s+");
            wordCount = (int) Arrays.stream(words).filter(word -> !word.isEmpty()).count();
        }

        record(new ContentEntryCreatedDomainEvent(
                contentEntryId.toString(),
                userId,
                contentBankId.toString(),
                type.toString(),
                processedContent,
                sourceUrl,
                pageTitle,
                now,
                wordCount,
                youtubeVideoDuration,
                youtubeVideoId,
                youtubeChannel != null ? youtubeChannel.getChannelName() : null,
                youtubeChannel != null ? youtubeChannel.getId().getValue() : null));
    }

    public void apply(ContentEntryCreatedDomainEvent event) {
        this.setId(ContentEntryId.map(event.getAggregateId()));
        this.userId = UserId.map(event.getUserId());
        this.contentBankId = ContentBankId.map(event.getContentBankId());
        this.contentType = ContentType.valueOf(event.getContentType());
        this.content = event.getContent();
        this.sourceUrl = event.getSourceUrl();
        this.pageTitle = event.getPageTitle();
        this.createdAt = event.getCreatedAt();
        this.questionsGenerated = false;
        this.wordCount = event.getWordCount();
        this.videoDuration = event.getVideoDuration();
        this.youtubeVideoId = event.getYoutubeVideoId();
        this.youtubeChannelId = YoutubeChannelId.map(event.getYoutubeChannelId());
    }

    public void update(String content, String pageTitle) {
        var now = LocalDateTime.now();
        Integer wordCount = null;
        if (Objects.nonNull(content) && !content.trim().isEmpty()) {
            wordCount = content.trim().split("\\s+").length;
        }

        record(new ContentEntryUpdatedDomainEvent(
                getId().getValue().toString(),
                userId,
                content,
                pageTitle,
                now,
                wordCount));
    }

    public void apply(ContentEntryUpdatedDomainEvent event) {
        this.content = event.getContent();
        this.pageTitle = event.getPageTitle();
        this.createdAt = event.getCreatedAt();
        this.wordCount = event.getWordCount();
    }

    public void updatedTopics(List<Topic> topics) {
        var now = LocalDateTime.now();
        record(new ContentEntryTopicAddedDomainEvent(
            getId().getValue().toString(),
            userId,
            Topic.toJson(new HashSet<>(topics)),
            now));
    }

    public void apply(ContentEntryTopicAddedDomainEvent event) {
        this.createdAt = event.getUpdatedAt();
    }

    public void delete() {
        record(new ContentEntryDeletedDomainEvent(
            getId().getValue().toString(),
            userId));
    }

    public void apply(ContentEntryDeletedDomainEvent event) {
        deactivate();
    }
}
