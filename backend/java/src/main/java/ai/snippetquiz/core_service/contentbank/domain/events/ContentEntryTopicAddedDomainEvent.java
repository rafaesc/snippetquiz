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
public class ContentEntryTopicAddedDomainEvent extends DomainEvent {
    private String topics;
    private LocalDateTime updatedAt;

    public ContentEntryTopicAddedDomainEvent(
            String aggregateId,
            UserId userId,
            String topics,
            LocalDateTime updatedAt) {
        super(aggregateId, userId.toString());
        this.topics = topics;
        this.updatedAt = updatedAt;
    }

    public ContentEntryTopicAddedDomainEvent(
            String aggregateId,
            UserId userId,
            String eventId,
            String occurredOn,
            int version,
            String topics,
            LocalDateTime updatedAt) {
        super(aggregateId, userId.toString(), eventId, occurredOn, version);
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
        primitives.put("updatedAt", Utils.dateToString(updatedAt));
        return primitives;
    }

    @Override
    public ContentEntryTopicAddedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version) {
        return new ContentEntryTopicAddedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("topics"),
                Utils.stringToDate((String) body.get("updatedAt")));
    }
}