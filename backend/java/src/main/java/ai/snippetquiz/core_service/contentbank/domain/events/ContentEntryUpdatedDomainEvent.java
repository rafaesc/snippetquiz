package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentEntryUpdatedDomainEvent extends DomainEvent {
    private final String userId;
    private final String content;
    private final String pageTitle;
    private final String createdAt;
    private final Integer wordCount;

    public ContentEntryUpdatedDomainEvent(
            String aggregateId,
            String userId,
            String content,
            String pageTitle,
            String createdAt,
            Integer wordCount) {
        super(aggregateId);
        this.userId = userId;
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
    }

    public ContentEntryUpdatedDomainEvent(
            String aggregateId,
            String eventId,
            String occurredOn,
            String userId,
            String content,
            String pageTitle,
            String createdAt,
            Integer wordCount) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
    }

    @Override
    public String eventName() {
        return "content_entry.topic_added";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        primitives.put("content", content);
        primitives.put("pageTitle", pageTitle);
        primitives.put("createdAt", createdAt);
        primitives.put("wordCount", wordCount);
        return primitives;
    }

    @Override
    public ContentEntryUpdatedDomainEvent fromPrimitives(
            String aggregateId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentEntryUpdatedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"),
                (String) body.get("content"),
                (String) body.get("pageTitle"),
                (String) body.get("createdAt"),
                (int) body.get("wordCount"));
    }
}