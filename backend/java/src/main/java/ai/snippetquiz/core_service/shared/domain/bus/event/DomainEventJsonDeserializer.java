package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class DomainEventJsonDeserializer {
    private final DomainEventsInformation information;

    @SuppressWarnings("unchecked")
    public <T extends DomainEvent> T deserialize(String body)
            throws InvocationTargetException, IllegalAccessException, NoSuchMethodException,
            InstantiationException {
        HashMap<String, Serializable> eventData = Utils.fromJson(body, new TypeReference<>() {
        });
        HashMap<String, Serializable> data = (HashMap<String, Serializable>) eventData.get("data");
        HashMap<String, Serializable> attributes = (HashMap<String, Serializable>) data.get("attributes");
        Class<? extends DomainEvent> domainEventClass = information.search((String) data.get("type"));

        DomainEvent nullInstance = domainEventClass.getConstructor().newInstance();

        Method fromPrimitivesMethod = domainEventClass.getMethod(
                "fromPrimitives",
                String.class,
                String.class,
                HashMap.class,
                String.class,
                String.class,
                int.class);

        return (T) fromPrimitivesMethod.invoke(
                nullInstance,
                (String) attributes.get("id"),
                (String) attributes.get("userId"),
                attributes,
                (String) data.get("id"),
                (String) data.get("occurred_on"),
                (int) data.get("version"));
    }

}
