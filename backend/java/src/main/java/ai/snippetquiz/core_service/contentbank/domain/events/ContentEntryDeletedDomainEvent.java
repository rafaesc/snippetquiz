package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@EqualsAndHashCode(callSuper = true)
public class ContentEntryDeletedDomainEvent extends DomainEvent implements DeactivationDomainEvent {

    public ContentEntryDeletedDomainEvent(String aggregateId, UserId userId) {
        super(aggregateId, userId.toString());
    }

    public ContentEntryDeletedDomainEvent(String aggregateId, UserId userId, String eventId, String occurredOn) {
        super(aggregateId, userId.toString(), eventId, occurredOn);
    }

    public static String eventName() {
        return "content_entry.deleted";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        return primitives;
    }

    @Override
    public ContentEntryDeletedDomainEvent fromPrimitives(String aggregateId, String userId, HashMap<String, Serializable> body,
            String eventId,
            String occurredOn) {
        return new ContentEntryDeletedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn);
    }
}
