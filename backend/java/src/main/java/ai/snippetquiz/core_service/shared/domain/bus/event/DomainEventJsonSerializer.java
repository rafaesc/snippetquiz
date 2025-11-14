package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;
import java.util.HashMap;

@Slf4j
public class DomainEventJsonSerializer {
    public static <T extends DomainEvent> String serialize(T domainEvent) {
        HashMap<String, Serializable> attributes = domainEvent.toPrimitives();
        attributes.put("id", domainEvent.getAggregateId());
        attributes.put("userId", domainEvent.getUserId());

        return Utils.toJson(new HashMap<String, Serializable>() {{
            put("data", new HashMap<String, Serializable>() {{
                put("id", domainEvent.getEventId());
                put("version", domainEvent.getVersion());
                put("type", Utils.getEventName(domainEvent.getClass()));
                put("occurred_on", domainEvent.getOccurredOn());
                put("attributes", attributes);
            }});
            put("meta", new HashMap<String, Serializable>());
        }});
    }
}
