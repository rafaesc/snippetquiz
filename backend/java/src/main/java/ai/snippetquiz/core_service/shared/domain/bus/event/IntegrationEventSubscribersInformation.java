package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.extern.slf4j.Slf4j;
import org.reflections.Reflections;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
public final class IntegrationEventSubscribersInformation {
    private final HashMap<String, List<IntegrationEventSubscriber>> information;
    private final ApplicationContext context;

    public IntegrationEventSubscribersInformation(ApplicationContext context) {
        this.context = context;
        Reflections reflections = new Reflections("ai.snippetquiz.core_service");
        Set<Class<?>> subscribers = reflections.getTypesAnnotatedWith(IntegrationEventSubscriberFor.class);
        this.information = formatSubscribers(subscribers);
    }

    public List<IntegrationEventSubscriber> search(String eventName) {
        return information.getOrDefault(eventName, Collections.emptyList());
    }

    public Map<String, List<IntegrationEventSubscriber>> getSubscribers() {
        return Collections.unmodifiableMap(information);
    }

    private HashMap<String, List<IntegrationEventSubscriber>> formatSubscribers(Set<Class<?>> subscriberClasses) {
        var map = new HashMap<String, List<IntegrationEventSubscriber>>();
        for (Class<?> subscriberClass : subscriberClasses) {
            IntegrationEventSubscriberFor annotation = subscriberClass.getAnnotation(IntegrationEventSubscriberFor.class);
            if (annotation == null) {
                continue;
            }

            Class<? extends IntegrationEvent>[] eventClasses = annotation.value();

            try {
                IntegrationEventSubscriber bean = getSubscriberBean(subscriberClass);
                if (bean == null) {
                    continue;
                }

                for (Class<? extends IntegrationEvent> eventClass : eventClasses) {
                    String eventName = Utils.getEventName(eventClass);
                    map.computeIfAbsent(eventName, k -> new ArrayList<>()).add(bean);
                }
            } catch (Exception e) {
                log.error("Unexpected error processing integration subscriber {}", subscriberClass.getName(), e);
            }
        }

        return map;
    }

    private IntegrationEventSubscriber getSubscriberBean(Class<?> subscriberClass) {
        try {
            Object bean = context.getBean(subscriberClass);
            return (IntegrationEventSubscriber) bean;
        } catch (org.springframework.beans.factory.NoSuchBeanDefinitionException e) {
            log.warn("No bean registered for integration subscriber {}", subscriberClass.getName());
            return null;
        } catch (ClassCastException e) {
            log.error("Subscriber {} does not implement IntegrationEventSubscriber", subscriberClass.getName(), e);
            return null;
        } catch (Exception e) {
            log.error("Error retrieving bean for integration subscriber {}", subscriberClass.getName(), e);
            return null;
        }
    }
}