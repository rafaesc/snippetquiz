package ai.snippetquiz.core_service.testing.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class SecondTestEvent extends DomainEvent {
    private String valueObject;

    public SecondTestEvent(String aggregateId, String userId, String valueObject) {
        super(aggregateId, userId);
        this.valueObject = valueObject;
    }

    public SecondTestEvent(
            String aggregateId,
            String userId,
            String eventId,
            String occurredOn,
            int version,
            String valueObject) {
        super(aggregateId, userId, eventId, occurredOn, version);
        this.valueObject = valueObject;
    }

    public static String eventName() {
        return "test.second.event";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("value_object", valueObject);
        return primitives;
    }

    @Override
    public DomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version) {
        return new SecondTestEvent(aggregateId, userId, eventId, occurredOn, version,
                (String) body.get("value_object"));
    }
}