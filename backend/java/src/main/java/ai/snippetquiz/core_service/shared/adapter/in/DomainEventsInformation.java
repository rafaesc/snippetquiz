package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.reflections.Reflections;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Set;

@Service
@Slf4j
@SuppressWarnings("rawtypes")
public final class DomainEventsInformation {
    HashMap<String, Class<? extends DomainEvent>> indexedDomainEvents;

    public DomainEventsInformation() {
        Reflections reflections = new Reflections("ai.snippetquiz.core_service");

        Set<Class<? extends DomainEvent>> classes = reflections.getSubTypesOf(DomainEvent.class);

        indexedDomainEvents = formatEvents(classes);
    }

    public Class<? extends DomainEvent> search(String eventName)
            throws IllegalArgumentException {
        Class<? extends DomainEvent> eventClass = indexedDomainEvents.get(eventName);

        if (null == eventClass) {
            throw new IllegalArgumentException("No event with eventId " + eventName + " has been registered");
        }

        return eventClass;
    }

    @SuppressWarnings("unchecked")
    private HashMap<String, Class<? extends DomainEvent>> formatEvents(
            Set<Class<? extends DomainEvent>> domainEvents) {
        HashMap<String, Class<? extends DomainEvent>> events = new HashMap<>();

        for (var event : domainEvents) {
            try {
                var method = event.getDeclaredMethod("eventId");
                method.setAccessible(true);
                String eventId = (String) method.invoke(event);

                events.put(eventId, event);
            } catch (NoSuchMethodException e) {
                log.error(MessageFormat.format("The eventId method was not found in the domain event for {0}", event.getName()));
            } catch (Exception e) {
                log.error("Error eventId", e);
            }
        }

        return events;
    }
}
