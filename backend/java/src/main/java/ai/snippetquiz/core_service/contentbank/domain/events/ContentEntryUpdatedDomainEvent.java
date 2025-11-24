package ai.snippetquiz.core_service.contentbank.domain.events;

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
public class ContentEntryUpdatedDomainEvent extends DomainEvent {
    private String content;
    private String pageTitle;
    private LocalDateTime createdAt;
    private Integer wordCount;

    public ContentEntryUpdatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            String content,
            String pageTitle,
            LocalDateTime createdAt,
            Integer wordCount) {
        super(aggregateId, userId.getValue());
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
    }

    public ContentEntryUpdatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String content,
            String pageTitle,
            LocalDateTime createdAt,
            Integer wordCount) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.content = content;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
    }

    public static String eventName() {
        return "content_entry.topic_added";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("content", content);
        primitives.put("page_title", pageTitle);
        primitives.put("created_at", Utils.dateToString(createdAt));
        primitives.put("word_count", wordCount);
        return primitives;
    }

    @Override
    public ContentEntryUpdatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new ContentEntryUpdatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("content"),
                (String) body.get("page_title"),
                Utils.stringToDate((String) body.get("created_at")),
                (Integer) body.get("word_count"));
    }
}