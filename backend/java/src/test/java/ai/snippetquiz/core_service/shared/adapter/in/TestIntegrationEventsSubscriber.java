package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.contentbank.domain.events.TopicsAddedIntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscriberFor;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

@IntegrationEventSubscriberFor({TopicsAddedIntegrationEvent.class})
@Service
@AllArgsConstructor
public class TestIntegrationEventsSubscriber implements IntegrationEventSubscriber {

    private static volatile IntegrationEvent lastEvent;
    private static CountDownLatch latch = new CountDownLatch(1);

    public static void reset() {
        lastEvent = null;
        latch = new CountDownLatch(1);
    }

    public static boolean await(long timeout, TimeUnit unit) throws InterruptedException {
        return latch.await(timeout, unit);
    }

    public static IntegrationEvent lastEvent() {
        return lastEvent;
    }

    @Override
    public void on(IntegrationEvent event) {
        lastEvent = event;
        latch.countDown();
    }
}