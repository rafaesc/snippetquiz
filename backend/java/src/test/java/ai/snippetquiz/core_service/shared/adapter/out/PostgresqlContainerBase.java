package ai.snippetquiz.core_service.shared.adapter.out;

import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
public abstract class PostgresqlContainerBase {
    @Container
    @SuppressWarnings("resource")
    protected static final PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:15.4");
}