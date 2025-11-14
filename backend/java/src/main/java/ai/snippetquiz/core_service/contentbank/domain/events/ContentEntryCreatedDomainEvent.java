package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
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
    private String youtubeChannelName;
    private Long youtubeChannelId;

    public ContentEntryCreatedDomainEvent(
            String aggregateId,
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
            String youtubeChannelName,
            Long youtubeChannelId) {
        super(aggregateId, userId.toString());
        this.contentBankId = contentBankId;
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
        this.videoDuration = videoDuration;
        this.youtubeVideoId = youtubeVideoId;
        this.youtubeChannelName = youtubeChannelName;
        this.youtubeChannelId = youtubeChannelId;
    }

    public ContentEntryCreatedDomainEvent(
            String aggregateId,
            UserId userId,
            String eventId,
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
            String youtubeChannelName,
            Long youtubeChannelId) {
        super(aggregateId, userId.toString(), eventId, occurredOn, version);
        this.contentBankId = contentBankId;
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
        this.videoDuration = videoDuration;
        this.youtubeVideoId = youtubeVideoId;
        this.youtubeChannelName = youtubeChannelName;
        this.youtubeChannelId = youtubeChannelId;
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
        primitives.put("youtube_channel_name", youtubeChannelName);
        primitives.put("youtube_channel_id", youtubeChannelId);
        return primitives;
    }

    @Override
    public ContentEntryCreatedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version) {
        return new ContentEntryCreatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("content_bank_id"),
                (String) body.get("content_type"),
                (String) body.get("content"),
                (String) body.get("source_url"),
                (String) body.get("page_title"),
                Utils.stringToDate((String) body.get("created_at")),
                (int) body.get("word_count"),
                (Integer) body.get("video_duration"),
                (String) body.get("youtube_video_id"),
                (String) body.get("youtube_channel_name"),
                (Long) body.get("youtube_channel_id"));
    }
}