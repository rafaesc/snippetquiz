package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentEntryCreatedDomainEvent extends DomainEvent {
    private String contentBankId;
    private String contentType;
    private String content;
    private String sourceUrl;
    private String pageTitle;
    private LocalDateTime createdAt;
    private Integer wordCount;
    private Integer videoDuration;
    private String youtubeVideoId;
    private Long youtubeChannelId;
    private String existsTopics;
    private boolean duplicated;

    public ContentEntryCreatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            String contentBankId,
            String contentType,
            String content,
            String sourceUrl,
            String pageTitle,
            LocalDateTime createdAt,
            Integer wordCount,
            Integer videoDuration,
            String youtubeVideoId,
            Long youtubeChannelId,
            String existsTopics,
            boolean duplicated) {
        super(aggregateId, userId.getValue());
        this.contentBankId = contentBankId;
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
        this.videoDuration = videoDuration;
        this.youtubeVideoId = youtubeVideoId;
        this.youtubeChannelId = youtubeChannelId;
        this.existsTopics = existsTopics;
        this.duplicated = duplicated;
    }

    public ContentEntryCreatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            int version,
            String contentBankId,
            String contentType,
            String content,
            String sourceUrl,
            String pageTitle,
            LocalDateTime createdAt,
            Integer wordCount,
            Integer videoDuration,
            String youtubeVideoId,
            Long youtubeChannelId,
            String existsTopics,
            boolean duplicated) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.contentBankId = contentBankId;
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
        this.videoDuration = videoDuration;
        this.youtubeVideoId = youtubeVideoId;
        this.youtubeChannelId = youtubeChannelId;
        this.existsTopics = existsTopics;
        this.duplicated = duplicated;
    }

    public static String eventName() {
        return "content_entry.created";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("content_bank_id", contentBankId);
        primitives.put("content_type", contentType);
        primitives.put("content", content);
        primitives.put("source_url", sourceUrl);
        primitives.put("page_title", pageTitle);
        primitives.put("created_at", Utils.dateToString(createdAt));
        primitives.put("word_count", wordCount);
        primitives.put("video_duration", videoDuration);
        primitives.put("youtube_video_id", youtubeVideoId);
        primitives.put("youtube_channel_id", youtubeChannelId);
        primitives.put("existsTopics", existsTopics);
        primitives.put("duplicated", duplicated);
        return primitives;
    }

    @Override
    public ContentEntryCreatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            int version) {
        return new ContentEntryCreatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("content_bank_id"),
                (String) body.get("content_type"),
                (String) body.get("content"),
                (String) body.get("source_url"),
                (String) body.get("page_title"),
                Utils.stringToDate((String) body.get("created_at")),
                (Integer) body.get("word_count"),
                (Integer) body.get("video_duration"),
                (String) body.get("youtube_video_id"),
                (Long) body.get("youtube_channel_id"),
                (String) body.get("existsTopics"),
                (Boolean) body.get("duplicated"));
    }
}