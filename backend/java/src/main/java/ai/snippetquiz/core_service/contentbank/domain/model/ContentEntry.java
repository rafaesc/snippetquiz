package ai.snippetquiz.core_service.contentbank.domain.model;

import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryDeletedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryQuestionCreatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryTopicAddedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.events.ContentEntryUpdatedDomainEvent;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryStatus;
import ai.snippetquiz.core_service.contentbank.domain.valueobject.YoutubeChannelId;
import ai.snippetquiz.core_service.shared.domain.ContentType;
import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.Topic;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Setter
@EqualsAndHashCode(callSuper = true)
@JsonSerialize
@NoArgsConstructor
@Slf4j
public class ContentEntry extends AggregateRoot<ContentEntryId> {
    private UserId userId;
    private ContentBankId contentBankId;
    private ContentType contentType;
    private String content;
    private String sourceUrl;
    private String pageTitle;
    private ContentEntryStatus status;
    private LocalDateTime createdAt;
    private Boolean questionsGenerated;
    private Integer wordCount;
    private Integer videoDuration;
    private String youtubeVideoId;
    private YoutubeChannelId youtubeChannelId;

    public String aggregateType() {
        return "content-entry.events";
    }

    public ContentEntry(
            UserId userId,
            ContentBankId contentBankId,
            ContentType type,
            String processedContent,
            String sourceUrl,
            String pageTitle,
            Integer youtubeVideoDuration,
            String youtubeVideoId,
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
                contentEntryId,
                userId,
                contentBankId.toString(),
                type.toString(),
                ContentEntryStatus.PENDING,
                processedContent,
                sourceUrl,
                pageTitle,
                now,
                wordCount,
                youtubeVideoDuration,
                youtubeVideoId,
                youtubeChannel != null ? youtubeChannel.getId().getValue() : null,
                false));
    }

    public ContentEntry(ContentEntry contentEntry, ContentBankId contentBankId) {
        if (contentEntry.getStatus().equals(ContentEntryStatus.PENDING)) {
            throw new IllegalArgumentException("Content entry status is PENDING");
        }

        var contentEntryId = UUID.randomUUID();
        var now = LocalDateTime.now();

        record(new ContentEntryCreatedDomainEvent(
                contentEntryId,
                contentEntry.getUserId(),
                contentBankId.toString(),
                contentEntry.getContentType().toString(),
                contentEntry.getStatus(),
                contentEntry.getContent(),
                contentEntry.getSourceUrl(),
                contentEntry.getPageTitle(),
                now,
                contentEntry.getWordCount(),
                contentEntry.getVideoDuration(),
                contentEntry.getYoutubeVideoId(),
                contentEntry.getYoutubeChannelId().getValue(),
                true));
    }

    public void apply(ContentEntryCreatedDomainEvent event) {
        this.setId(new ContentEntryId(event.getAggregateId()));
        this.userId = new UserId(event.getUserId());
        this.contentBankId = ContentBankId.map(event.getContentBankId());
        this.contentType = ContentType.valueOf(event.getContentType());
        this.content = event.getContent();
        this.sourceUrl = event.getSourceUrl();
        this.status = event.getStatus();
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
                getId().getValue(),
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
                getId().getValue(),
                userId,
                topics.stream().map(Topic::getTopic).toList(),
                ContentEntryStatus.ANALYZED.name(),
                now));
    }

    public void apply(ContentEntryTopicAddedDomainEvent event) {
        this.createdAt = event.getUpdatedAt();
        this.status = ContentEntryStatus.valueOf(event.getStatus());
    }

    public void questionsGenerated() {
        if (Boolean.TRUE.equals(questionsGenerated)) {
            log.info("Questions already generated for content entry {}", getId().getValue());
            return;
        }
        record(new ContentEntryQuestionCreatedDomainEvent(
                getId().getValue(),
                userId));
    }

    public void apply(ContentEntryQuestionCreatedDomainEvent event) {
        this.questionsGenerated = true;
    }

    public void delete() {
        record(new ContentEntryDeletedDomainEvent(
                getId().getValue(),
                userId));
    }

    public void apply(ContentEntryDeletedDomainEvent event) {
        deactivate();
    }
}
