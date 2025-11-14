package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateRootSubscribersInformation;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonDeserializer;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.stereotype.Component;
import org.springframework.context.SmartLifecycle;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@Slf4j
public class KafkaEventsConsumer implements SmartLifecycle {

    private final AggregateRootSubscribersInformation subscribersInformation;
    private final DomainEventJsonDeserializer deserializer;
    private final ConsumerFactory<String, String> consumerFactory;
    private KafkaConsumer<String, String> consumer;
    private Thread thread;
    private volatile boolean running = false;

    public KafkaEventsConsumer(
            AggregateRootSubscribersInformation subscribersInformation,
            DomainEventJsonDeserializer deserializer,
            ConsumerFactory<String, String> consumerFactory
    ) {
        this.subscribersInformation = subscribersInformation;
        this.deserializer = deserializer;
        this.consumerFactory = consumerFactory;
    }

    @Override
    public void start() {
        consumer = (KafkaConsumer<String, String>) consumerFactory.createConsumer();

        Set<String> topics = resolveTopicsFromSubscribers();
        if (topics.isEmpty()) {
            log.warn("No topics resolved from subscribers; Kafka consumer will not subscribe.");
        } else {
            consumer.subscribe(new ArrayList<>(topics));
            log.info("Kafka consumer subscribed to topics: {}", topics);
        }

        running = true;

        thread = new Thread(() -> {
            try {
                while (running) {
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
                    for (ConsumerRecord<String, String> record : records) {
                        processMessage(record);
                    }
                    consumer.commitSync();
                }
            } catch (Exception e) {
                log.error("Error in Kafka polling loop", e);
            } finally {
                consumer.close();
            }
        }, "manual-kafka-events-consumer-thread");
        thread.start();
    }

    @Override
    public void stop() {
        running = false;
        if (consumer != null) {
            consumer.wakeup();
        }
        try {
            if (thread != null) {
                thread.join();
            }
        } catch (InterruptedException ignored) { }
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    private void processMessage(ConsumerRecord<String, String> record) {
        String topic = record.topic();
        String payload = record.value();

        try {
            DomainEvent event = deserializer.deserialize(payload);
            List<AggregateEventSubscriber> subscribers = subscribersInformation.search(topic);

            if (subscribers.isEmpty()) {
                log.debug("No subscribers found for topic {}", topic);
                return;
            }

            for (AggregateEventSubscriber subscriber : subscribers) {
                try {
                    subscriber.on(event);
                } catch (Exception ex) {
                    log.error("Error dispatching event to subscriber {} for topic {}",
                            subscriber.getClass().getName(), topic, ex);
                }
            }
        } catch (Exception e) {
            log.error("Failed to deserialize or process event from topic {}", topic, e);
        }
    }

    private Set<String> resolveTopicsFromSubscribers() {
        Set<String> topics = new HashSet<>();
        topics.addAll(subscribersInformation.getSubscribers().keySet());
        return topics;
    }
}