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
public class ContentEntryTopicAddedDomainEvent extends DomainEvent {
    private String topics;
    private LocalDateTime updatedAt;

    public ContentEntryTopicAddedDomainEvent(
            UUID aggregateId,
            UserId userId,
            String topics,
            LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue());
        this.topics = topics;
        this.updatedAt = updatedAt;
    }

    public ContentEntryTopicAddedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            int version,
            String topics,
            LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.topics = topics;
        this.updatedAt = updatedAt;
    }

    public static String eventName() {
        return "content_entry.updated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("topics", topics);
        primitives.put("updated_at", Utils.dateToString(updatedAt));
        return primitives;
    }

    @Override
    public ContentEntryTopicAddedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            int version) {
        return new ContentEntryTopicAddedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("topics"),
                Utils.stringToDate((String) body.get("updated_at")));
    }
}