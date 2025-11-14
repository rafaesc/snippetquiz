package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
import java.util.HashMap;

import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentEntryDeletedDomainEvent extends DomainEvent implements DeactivationDomainEvent {

    public ContentEntryDeletedDomainEvent(String aggregateId, UserId userId) {
        super(aggregateId, userId.toString());
    }

    public ContentEntryDeletedDomainEvent(
            String aggregateId,
            UserId userId,
            String eventId,
            String occurredOn,
            int version) {
        super(aggregateId, userId.toString(), eventId, occurredOn, version);
    }

    public static String eventName() {
        return "content_entry.deleted";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        return new HashMap<>();
    }

    @Override
    public ContentEntryDeletedDomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version) {
        return new ContentEntryDeletedDomainEvent(
                aggregateId,
                UserId.map(userId),
                eventId,
                occurredOn,
                version);
    }
}
