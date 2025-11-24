package ai.snippetquiz.core_service.testing.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SecondTestEvent extends DomainEvent {
    private String valueObject;

    public SecondTestEvent(UUID aggregateId, UUID userId, String valueObject) {
        super(aggregateId, userId);
        this.valueObject = valueObject;
    }

    public SecondTestEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String valueObject) {
        super(aggregateId, userId, eventId, occurredOn, version);
        this.valueObject = valueObject;
    }

    public static String eventName() {
        return "test.second.event";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("value_object", valueObject);
        return primitives;
    }

    @Override
    public DomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new SecondTestEvent(aggregateId, userId, eventId, occurredOn, version,
                (String) body.get("value_object"));
    }
}