package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;

@Slf4j
public class DomainEventJsonSerializer {
    public static <T extends DomainEvent> String serialize(T domainEvent) {
        HashMap<String, Object> attributes = domainEvent.toPrimitives();
        attributes.put("aggregate_id", domainEvent.getAggregateId());
        attributes.put("user_id", domainEvent.getUserId());

<<<<<<< HEAD
        return Utils.toJson(new HashMap<String, Object>() {
            {
                put("data", new HashMap<String, Object>() {
                    {
                        put("event_id", domainEvent.getEventId());
                        put("version", domainEvent.getVersion());
                        put("type", Utils.getEventName(domainEvent.getClass()));
                        put("occurred_on", domainEvent.getOccurredOn());
                        put("attributes", attributes);
                    }
                });
                put("meta", new HashMap<String, Object>());
            }
        });
=======
        return Utils.toJson(new HashMap<String, Object>() {{
            put("data", new HashMap<String, Object>() {{
                put("event_id", domainEvent.getEventId());
                put("version", domainEvent.getVersion());
                put("type", Utils.getEventName(domainEvent.getClass()));
                put("occurred_on", domainEvent.getOccurredOn());
                put("attributes", attributes);
            }});
            put("meta", new HashMap<String, Object>());
        }});
>>>>>>> 363c56c (feat: core service and ai processor event driven)
    }

    public static <T extends DomainEvent> String serializePrimitives(T domainEvent) {
        return Utils.toJson(domainEvent.toPrimitives());
    }
}
