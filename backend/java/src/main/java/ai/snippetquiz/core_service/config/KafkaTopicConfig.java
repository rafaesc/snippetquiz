package ai.snippetquiz.core_service.config;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

@Configuration
public class KafkaTopicConfig {
    
    @Value(value = "${spring.kafka.bootstrap-servers}")
    private String bootstrapAddress;

    @Bean
    KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress);
        return new KafkaAdmin(configs);
    }

    @Bean
    NewTopic createQuizTopic() {
        return new NewTopic("create-quiz", 1, (short) 1);
    }

    @Bean
    NewTopic contentEntryEventsTopic() {
        return new NewTopic("content-entry-events", 1, (short) 1);
    }

    @Bean
    NewTopic quizGenerationTopic() {
        return new NewTopic("quiz-generation", 1, (short) 1);
    }
}