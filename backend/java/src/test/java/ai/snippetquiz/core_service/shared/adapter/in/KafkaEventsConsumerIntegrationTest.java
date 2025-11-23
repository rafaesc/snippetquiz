package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateEventSubscriber;
import ai.snippetquiz.core_service.shared.domain.bus.event.AggregateRootSubscribersInformation;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventJsonDeserializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.bus.event.EventsInformation;
import ai.snippetquiz.core_service.shared.domain.bus.event.IntegrationEventSubscribersInformation;
import ai.snippetquiz.core_service.contentbank.domain.events.TopicsAddedIntegrationEvent;
import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
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
        EventsInformation eventsInformation = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(eventsInformation);

        // Build a ConsumerFactory pointing to Testcontainers Kafka
        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(BOOTSTRAP_SERVERS_CONFIG, KafkaContainerBase.KAFKA.getBootstrapServers());
        consumerProps.put(GROUP_ID_CONFIG, "kec-it-group");
        consumerProps.put(KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ENABLE_AUTO_COMMIT_CONFIG, false);

        ConsumerFactory<String, String> consumerFactory = new DefaultKafkaConsumerFactory<>(consumerProps);

        // Start manual consumer
        IntegrationEventSubscribersInformation integrationInfo = new IntegrationEventSubscribersInformation(ctx);
        consumer = new KafkaEventsConsumer(subscribersInformation, deserializer, consumerFactory, integrationInfo);
        TestQuizEventsSubscriber.reset();
        consumer.start();

        // Produce a serialized domain event to the aggregate topic
        String topic = (new Quiz()).aggregateType();
        var userId = UUID.randomUUID();
        var aggregateId = UUID.randomUUID();
        QuizDeletedDomainEvent event = new QuizDeletedDomainEvent(aggregateId, new UserId(userId));
        String payload = DomainEventJsonSerializer.serialize(event);

        try (KafkaProducer<String, String> producer = buildStringProducer(KafkaContainerBase.KAFKA.getBootstrapServers())) {
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

    @Test
    void consumer_processes_integration_event_and_dispatches_to_integration_subscriber() throws Exception {
        GenericApplicationContext ctx = new GenericApplicationContext();
        ctx.registerBean(TestIntegrationEventsSubscriber.class);
        ctx.refresh();

        AggregateRootSubscribersInformation aggInfo = new AggregateRootSubscribersInformation(ctx);
        IntegrationEventSubscribersInformation integrationInfo = new IntegrationEventSubscribersInformation(ctx);

        EventsInformation eventsInformation = new EventsInformation();
        EventJsonDeserializer deserializer = new EventJsonDeserializer(eventsInformation);

        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(BOOTSTRAP_SERVERS_CONFIG, KafkaContainerBase.KAFKA.getBootstrapServers());
        consumerProps.put(GROUP_ID_CONFIG, "kec-it-group-int");
        consumerProps.put(KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ENABLE_AUTO_COMMIT_CONFIG, false);

        ConsumerFactory<String, String> consumerFactory = new DefaultKafkaConsumerFactory<>(consumerProps);

        consumer = new KafkaEventsConsumer(aggInfo, deserializer, consumerFactory, integrationInfo);
        TestIntegrationEventsSubscriber.reset();
        consumer.start();

        String topic = Utils.getEventName(TopicsAddedIntegrationEvent.class);

        java.util.List<String> topics = java.util.List.of("java", "spring");
        java.util.HashMap<String, java.io.Serializable> attributes = new java.util.HashMap<>();
        attributes.put("aggregate_id", java.util.UUID.randomUUID().toString());
        attributes.put("user_id", java.util.UUID.randomUUID().toString());
        attributes.put("topics", Utils.toJson(topics));

        java.util.HashMap<String, java.io.Serializable> data = new java.util.HashMap<>();
        data.put("event_id", java.util.UUID.randomUUID().toString());
        data.put("version", 0);
        data.put("type", topic);
        data.put("occurred_on", "2024-01-01T00:00:00");
        data.put("attributes", attributes);

        java.util.HashMap<String, java.io.Serializable> root = new java.util.HashMap<>();
        root.put("data", data);
        root.put("meta", new java.util.HashMap<>());

        String payload = Utils.toJson(root);

        try (KafkaProducer<String, String> producer = buildStringProducer(KafkaContainerBase.KAFKA.getBootstrapServers())) {
            producer.send(new ProducerRecord<>(topic, payload)).get();
        }

        boolean received = TestIntegrationEventsSubscriber.await(10, TimeUnit.SECONDS);
        assertTrue(received, "Integration subscriber should receive the event within timeout");

        var dispatched = TestIntegrationEventsSubscriber.lastEvent();
        assertNotNull(dispatched, "Dispatched integration event should not be null");
        assertInstanceOf(TopicsAddedIntegrationEvent.class, dispatched, "Dispatched integration event type should match produced one");
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