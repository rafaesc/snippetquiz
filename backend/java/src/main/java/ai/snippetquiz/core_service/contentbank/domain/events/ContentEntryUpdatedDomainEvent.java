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
public class ContentEntryUpdatedDomainEvent extends DomainEvent {
    private String content;
    private String pageTitle;
    private LocalDateTime createdAt;
    private Integer wordCount;

    public ContentEntryUpdatedDomainEvent(
            String aggregateId,
            UserId userId,
            String content,
            String pageTitle,
            LocalDateTime createdAt,
            Integer wordCount) {
        super(aggregateId, userId.toString());
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
    }

    public ContentEntryUpdatedDomainEvent(
            String aggregateId,
            UserId userId,
            String eventId,
            String occurredOn,
            String content,
            String pageTitle,
            LocalDateTime createdAt,
            Integer wordCount) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
    }

    public static String eventName() {
        return "content_entry.topic_added";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("content", content);
        primitives.put("pageTitle", pageTitle);
        primitives.put("createdAt", Utils.dateToString(createdAt));
        primitives.put("wordCount", wordCount);
        return primitives;
    }

    @Override
    public ContentEntryUpdatedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentEntryUpdatedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                (String) body.get("content"),
                (String) body.get("pageTitle"),
                Utils.stringToDate((String) body.get("createdAt")),
                (int) body.get("wordCount"));
    }
}