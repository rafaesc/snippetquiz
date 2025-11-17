package ai.snippetquiz.core_service.shared.adapter.in;

import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.kafka.ConfluentKafkaContainer;

@Testcontainers
public class KafkaContainerBase {
    public static final ConfluentKafkaContainer KAFKA =
            new ConfluentKafkaContainer("confluentinc/cp-kafka:7.4.0");

    static {
        KAFKA.start();
    }
}