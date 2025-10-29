package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentEntryTopicAddedDomainEvent extends DomainEvent {
    private final String userId;
    private final String topics;
    private final String updatedAt;

    public ContentEntryTopicAddedDomainEvent(
            String aggregateId,
            String userId,
            String topics,
            String updatedAt) {
        super(aggregateId);
        this.userId = userId;
        this.topics = topics;
        this.updatedAt = updatedAt;
    }

    public ContentEntryTopicAddedDomainEvent(
            String aggregateId,
            String eventId,
            String occurredOn,
            String userId,
            String topics,
            String updatedAt) {
        super(aggregateId, eventId, occurredOn);
        this.userId = userId;
        this.topics = topics;
        this.updatedAt = updatedAt;
    }

    @Override
    public String eventName() {
        return "content_entry.updated";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("userId", userId);
        primitives.put("topics", topics);
        primitives.put("updatedAt", updatedAt);
        return primitives;
    }

    @Override
    public ContentEntryTopicAddedDomainEvent fromPrimitives(
            String aggregateId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentEntryTopicAddedDomainEvent(
                aggregateId,
                eventId,
                occurredOn,
                (String) body.get("userId"),
                (String) body.get("topics"),
                (String) body.get("updatedAt"));
    }
}