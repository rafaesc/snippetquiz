package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class EventJsonDeserializer {
        private final EventsInformation information;

        public <T extends BaseEvent> T deserialize(String body)
                        throws InvocationTargetException, IllegalAccessException, NoSuchMethodException,
                        InstantiationException {
                HashMap<String, Object> eventData = Utils.fromJson(body, new TypeReference<>() {
                });
                HashMap<String, Object> data = (HashMap<String, Object>) eventData.get("data");
                HashMap<String, Object> attributes = (HashMap<String, Object>) data.get("attributes");
                Class<? extends BaseEvent> eventClass = information.search((String) data.get("type"));

                BaseEvent nullInstance = eventClass.getConstructor().newInstance();

                Method fromPrimitivesMethod = eventClass.getMethod(
                                "fromPrimitives",
                                java.util.UUID.class,
                                java.util.UUID.class,
                                HashMap.class,
                                java.util.UUID.class,
                                String.class,
                                Integer.class);

                return (T) fromPrimitivesMethod.invoke(
                                nullInstance,
                                java.util.UUID.fromString((String) attributes.get("aggregate_id")),
                                java.util.UUID.fromString((String) attributes.get("user_id")),
                                attributes,
                                java.util.UUID.fromString((String) data.get("event_id")),
                                (String) data.get("occurred_on"),
                                (Integer) data.get("version"));
        }

        public <T extends BaseEvent> T deserializePrimitives(
                        String eventId,
                        String userId,
                        String aggregateId,
                        String eventName,
                        String occurredOn,
                        Integer version,
                        String body) throws InvocationTargetException, IllegalAccessException, NoSuchMethodException,
                        InstantiationException {
                HashMap<String, Object> attributes = Utils.fromJson(body, new TypeReference<>() {
                });
                Class<? extends BaseEvent> eventClass = information.search(eventName);

                BaseEvent nullInstance = eventClass.getConstructor().newInstance();

                Method fromPrimitivesMethod = eventClass.getMethod(
                                "fromPrimitives",
                                java.util.UUID.class,
                                java.util.UUID.class,
                                HashMap.class,
                                java.util.UUID.class,
                                String.class,
                                Integer.class);

                return (T) fromPrimitivesMethod.invoke(
                                nullInstance,
                                java.util.UUID.fromString(aggregateId),
                                java.util.UUID.fromString(userId),
                                attributes,
                                java.util.UUID.fromString(eventId),
                                occurredOn,
                                version);
        }

}
