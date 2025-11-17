package ai.snippetquiz;

import ai.snippetquiz.core_service.shared.adapter.in.KafkaContainerBase;
import ai.snippetquiz.core_service.shared.adapter.in.PostgresContainerBase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", PostgresContainerBase.POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", PostgresContainerBase.POSTGRES::getUsername);
        registry.add("spring.datasource.password", PostgresContainerBase.POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");

        registry.add("spring.kafka.bootstrap-servers", KafkaContainerBase.KAFKA::getBootstrapServers);
        registry.add("spring.kafka.consumer.group-id", () -> "test-consumer");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }
}