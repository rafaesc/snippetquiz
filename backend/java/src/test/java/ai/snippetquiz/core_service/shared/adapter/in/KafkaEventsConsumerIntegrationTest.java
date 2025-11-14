package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateRootSubscribersInformation;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventsInformation;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.apache.kafka.clients.consumer.ConsumerConfig.AUTO_OFFSET_RESET_CONFIG;
import static org.apache.kafka.clients.consumer.ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG;
import static org.apache.kafka.clients.consumer.ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG;
import static org.apache.kafka.clients.consumer.ConsumerConfig.GROUP_ID_CONFIG;
import static org.apache.kafka.clients.consumer.ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG;
import static org.apache.kafka.clients.consumer.ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;


@Testcontainers
class KafkaEventsConsumerIntegrationTest extends KafkaContainerBase {

    private KafkaEventsConsumer consumer;

    @AfterEach
    void tearDown() {
        if (consumer != null && consumer.isRunning()) {
            consumer.stop();
        }
    }

    @Test
    void consumer_processes_event_from_kafka_and_dispatches_to_subscriber() throws Exception {
        // Register test subscriber in a minimal Spring context
        GenericApplicationContext ctx = new GenericApplicationContext();
        ctx.registerBean(TestQuizEventsSubscriber.class);
        ctx.refresh();

        // Subscribers information scans only test package to avoid non-registered beans
        AggregateRootSubscribersInformation subscribersInformation = new AggregateRootSubscribersInformation(ctx);

        // Real deserializer using reflections-based event registry
        DomainEventsInformation eventsInformation = new DomainEventsInformation();
        DomainEventJsonDeserializer deserializer = new DomainEventJsonDeserializer(eventsInformation);

        // Build a ConsumerFactory pointing to Testcontainers Kafka
        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        consumerProps.put(GROUP_ID_CONFIG, "kec-it-group");
        consumerProps.put(KEY_DESERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringDeserializer.class);
        consumerProps.put(VALUE_DESERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringDeserializer.class);
        consumerProps.put(AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ENABLE_AUTO_COMMIT_CONFIG, false);

        ConsumerFactory<String, String> consumerFactory = new DefaultKafkaConsumerFactory<>(consumerProps);

        // Start manual consumer
        consumer = new KafkaEventsConsumer(subscribersInformation, deserializer, consumerFactory);
        TestQuizEventsSubscriber.reset();
        consumer.start();

        // Produce a serialized domain event to the aggregate topic
        String topic = "quiz-aggregate";
        var userId = UUID.randomUUID();
        QuizDeletedDomainEvent event = new QuizDeletedDomainEvent("agg-123", new UserId(userId));
        String payload = DomainEventJsonSerializer.serialize(event);

        try (KafkaProducer<String, String> producer = buildStringProducer(kafka.getBootstrapServers())) {
            producer.send(new ProducerRecord<>(topic, payload)).get();
        }

        // Await subscriber reception and assert
        boolean received = TestQuizEventsSubscriber.await(10, TimeUnit.SECONDS);
        assertTrue(received, "Subscriber should receive the event within timeout");

        var dispatched = TestQuizEventsSubscriber.lastEvent();
        assertNotNull(dispatched, "Dispatched event should not be null");
        assertInstanceOf(QuizDeletedDomainEvent.class, dispatched, "Dispatched event type should match produced one");

        // Also assert subscriber lookup works for the topic
        var topicSubscribers = subscribersInformation.search(topic);
        assertFalse(topicSubscribers.isEmpty(), "Subscribers for 'quiz-aggregate' should not be empty");
        assertTrue(topicSubscribers.stream().allMatch(s -> s instanceof AggregateEventSubscriber),
                "All subscribers must implement AggregateEventSubscriber");
    }

    private KafkaProducer<String, String> buildStringProducer(String bootstrapServers) {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.CLIENT_ID_CONFIG, "kec-it-producer");
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringSerializer.class);
        return new KafkaProducer<>(props);
    }
}