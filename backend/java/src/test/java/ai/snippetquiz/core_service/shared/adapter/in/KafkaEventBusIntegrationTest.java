package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.quiz.domain.events.QuizDeletedDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEventJsonSerializer;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.Test;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@Testcontainers
class KafkaEventBusIntegrationTest extends KafkaContainerBase {

    @Test
    void event_bus_publishes_message_to_kafka_with_expected_key_and_payload() {
        // Build a KafkaTemplate connected to Testcontainers Kafka
        Map<String, Object> producerProps = new HashMap<>();
        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        producerProps.put(ProducerConfig.CLIENT_ID_CONFIG, "keb-it-producer");
        producerProps.put(ProducerConfig.ACKS_CONFIG, "all");
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringSerializer.class);
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.StringSerializer.class);

        DefaultKafkaProducerFactory<String, String> producerFactory = new DefaultKafkaProducerFactory<>(producerProps);
        KafkaTemplate<String, String> kafkaTemplate = new KafkaTemplate<>(producerFactory);

        // Build a consumer to verify the produced message
        Map<String, Object> consumerProps = new HashMap<>();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "keb-it-group");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

        DefaultKafkaConsumerFactory<String, String> consumerFactory = new DefaultKafkaConsumerFactory<>(consumerProps);
        Consumer<String, String> consumer = consumerFactory.createConsumer();

        try {
            String topic = "quiz-aggregate";
            consumer.subscribe(Collections.singletonList(topic));

            // Instantiate EventBus with KafkaTemplate
            KafkaEventBus eventBus = new KafkaEventBus(kafkaTemplate);

            // Prepare a domain event and publish
            var userId = new UserId(UUID.randomUUID());
            var aggregateId = UUID.randomUUID();
            QuizDeletedDomainEvent event = new QuizDeletedDomainEvent(aggregateId, userId);
            String expectedPayload = DomainEventJsonSerializer.serialize(event);

            eventBus.publish(topic, Collections.singletonList(event));
            kafkaTemplate.flush();

            // Poll for the published record
            ConsumerRecords<String, String> records = ConsumerRecords.empty();
            long deadline = System.currentTimeMillis() + 10_000; // up to 10 seconds
            while (System.currentTimeMillis() < deadline && records.isEmpty()) {
                records = consumer.poll(Duration.ofMillis(500));
            }

            assertFalse(records.isEmpty(), "Expected to receive at least one record from Kafka");
            var record = records.iterator().next();
            assertEquals(aggregateId.toString(), record.key(), "Kafka key should be the aggregateId");
            assertEquals(expectedPayload, record.value(), "Kafka value should match serialized domain event");
        } finally {
            // Cleanup resources
            try {
                consumer.close();
            } catch (Exception ignored) { }
            try {
                kafkaTemplate.destroy();
            } catch (Exception ignored) { }
        }
    }
}