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
        super(aggregateId, userId.toString(), eventId, occurredOn);
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
        primitives.put("contentBankId", contentBankId);
        primitives.put("contentType", contentType);
        primitives.put("content", content);
        primitives.put("sourceUrl", sourceUrl);
        primitives.put("pageTitle", pageTitle);
        primitives.put("createdAt", Utils.dateToString(createdAt));
        primitives.put("wordCount", wordCount);
        primitives.put("videoDuration", videoDuration);
        primitives.put("youtubeVideoId", youtubeVideoId);
        primitives.put("youtubeChannelName", youtubeChannelName);
        primitives.put("youtubeChannelId", youtubeChannelId);
        return primitives;
    }

    @Override
    public ContentEntryCreatedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentEntryCreatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                (String) body.get("contentBankId"),
                (String) body.get("contentType"),
                (String) body.get("content"),
                (String) body.get("sourceUrl"),
                (String) body.get("pageTitle"),
                Utils.stringToDate((String) body.get("createdAt")),
                (int) body.get("wordCount"),
                (Integer) body.get("videoDuration"),
                (String) body.get("youtubeVideoId"),
                (String) body.get("youtubeChannelName"),
                (Long) body.get("youtubeChannelId"));
    }
}