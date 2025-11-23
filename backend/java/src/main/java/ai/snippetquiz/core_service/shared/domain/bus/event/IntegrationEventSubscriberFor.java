package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface IntegrationEventSubscriberFor {
    Class<? extends IntegrationEvent>[] value();
}