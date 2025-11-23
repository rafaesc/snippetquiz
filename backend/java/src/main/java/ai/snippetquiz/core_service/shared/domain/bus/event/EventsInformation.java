package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.extern.slf4j.Slf4j;
import org.reflections.Reflections;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Set;

import static java.util.stream.Collectors.toSet;

@Service
@Slf4j
public final class EventsInformation {
    HashMap<String, Class<? extends BaseEvent>> indexedDomainEvents;

    public EventsInformation() {
        Reflections reflections = new Reflections("ai.snippetquiz.core_service");

        Set<Class<? extends BaseEvent>> domainEventClasses = reflections.getSubTypesOf(DomainEvent.class).stream().collect(toSet());
        Set<Class<? extends BaseEvent>> integrationEventClasses = reflections.getSubTypesOf(IntegrationEvent.class).stream().collect(toSet());

        domainEventClasses.addAll(integrationEventClasses);
        indexedDomainEvents = formatDomainEvents(domainEventClasses);
    }

    public Class<? extends BaseEvent> search(String eventName)
            throws IllegalArgumentException {
        Class<? extends BaseEvent> eventClass = indexedDomainEvents.get(eventName);

        if (null == eventClass) {
            throw new IllegalArgumentException("No event with eventId " + eventName + " has been registered");
        }

        return eventClass;
    }

    private HashMap<String, Class<? extends BaseEvent>> formatDomainEvents(
            Set<Class<? extends BaseEvent>> domainEvents) {
        HashMap<String, Class<? extends BaseEvent>> events = new HashMap<>();

        for (var event : domainEvents) {
            events.put(Utils.getEventName(event), event);
        }

        return events;
    }
}
