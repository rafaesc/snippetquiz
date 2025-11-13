package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.extern.slf4j.Slf4j;

import java.io.Serializable;
import java.util.HashMap;

@Slf4j
public class DomainEventJsonSerializer {
    public static <T extends DomainEvent> String serialize(T domainEvent) {
        HashMap<String, Serializable> attributes = domainEvent.toPrimitives();
        attributes.put("id", domainEvent.aggregateId());
        attributes.put("userId", domainEvent.getUserId());

        return Utils.toJson(new HashMap<String, Serializable>() {{
            put("data", new HashMap<String, Serializable>() {{
                put("id", domainEvent.eventId());

                var eventClass = domainEvent.getClass();
                try {
                    var method = eventClass.getDeclaredMethod("eventName");
                    method.setAccessible(true);
                    String eventName = (String) method.invoke(domainEvent);

                    put("type", eventName);
                } catch (NoSuchMethodException e) {
                    log.error("The eventName method was not found in the domain event for {}", eventClass.getName());
                } catch (Exception e) {
                    log.error("Error eventName", e);
                }

                put("occurred_on", domainEvent.occurredOn());
                put("attributes", attributes);
            }});
            put("meta", new HashMap<String, Serializable>());
        }});
    }
}
