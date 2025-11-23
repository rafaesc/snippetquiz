package ai.snippetquiz.core_service.testing.events;

import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.UUID;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class IntegrationTestEvent extends IntegrationEvent {
    private String valueObject;


    public IntegrationTestEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String valueObject
    ) {
        super(aggregateId, userId, eventId, occurredOn, version);
        this.valueObject = valueObject;
    }

    public static String eventName() {
        return "test.integration.event";
    }


    @Override
    public IntegrationEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            Integer version
    ) {
        return new IntegrationTestEvent(
                aggregateId,
                userId,
                eventId,
                occurredOn,
                version,
                (String) body.get("value_object")
        );
    }
}