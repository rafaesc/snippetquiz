package ai.snippetquiz.core_service.shared.domain.bus.event;

import ai.snippetquiz.core_service.shared.domain.entity.AggregateRoot;
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
public final class AggregateRootSubscribersInformation {
    private final HashMap<String, List<AggregateEventSubscriber>> information;
    private final ApplicationContext context;

    public AggregateRootSubscribersInformation(ApplicationContext context) {
        this.context = context;
        Reflections reflections = new Reflections("ai.snippetquiz.core_service");
        Set<Class<?>> subscribers = reflections.getTypesAnnotatedWith(AggregateEventSubscriberFor.class);
        this.information = formatSubscribers(subscribers);
    }

    public List<AggregateEventSubscriber> search(String aggregateType) {
        return information.getOrDefault(aggregateType, Collections.emptyList());
    }

    public Map<String, List<AggregateEventSubscriber>> getSubscribers() {
        return Collections.unmodifiableMap(information);
    }
    private HashMap<String, List<AggregateEventSubscriber>> formatSubscribers(Set<Class<?>> subscriberClasses) {
        var map = new HashMap<String, List<AggregateEventSubscriber>>();
        for (Class<?> subscriberClass : subscriberClasses) {
            AggregateEventSubscriberFor annotation = subscriberClass.getAnnotation(AggregateEventSubscriberFor.class);
            if (annotation == null) {
                continue;
            }

            Class<? extends AggregateRoot<?>> aggregateClass = annotation.value();

            try {
                Object aggregateInstance = aggregateClass.getDeclaredConstructor().newInstance();

                java.lang.reflect.Method getAggregateType = aggregateClass.getDeclaredMethod("aggregateType");
                getAggregateType.setAccessible(true);
                String aggregateType = (String) getAggregateType.invoke(aggregateInstance);

                AggregateEventSubscriber bean = getSubscriberBean(subscriberClass);
                if (bean != null) {
                    map.computeIfAbsent(aggregateType, k -> new ArrayList<>()).add(bean);
                }
            } catch (NoSuchMethodException e) {
                log.error("Aggregate {} must implement getAggregateType()", aggregateClass.getName(), e);
            } catch (ReflectiveOperationException e) {
                log.error("Error instantiating aggregate {} to resolve type", aggregateClass.getName(), e);
            } catch (Exception e) {
                log.error("Unexpected error processing subscriber {}", subscriberClass.getName(), e);
            }
        }

        return map;
    }

    private AggregateEventSubscriber getSubscriberBean(Class<?> subscriberClass) {
        try {
            Object bean = context.getBean(subscriberClass);
            return (AggregateEventSubscriber) bean;
        } catch (org.springframework.beans.factory.NoSuchBeanDefinitionException e) {
            log.warn("No bean registered for subscriber {}", subscriberClass.getName());
            return null;
        } catch (ClassCastException e) {
            log.error("Subscriber {} does not implement AggregateEventSubscriber", subscriberClass.getName(), e);
            return null;
        } catch (Exception e) {
            log.error("Error retrieving bean for subscriber {}", subscriberClass.getName(), e);
            return null;
        }
    }
}