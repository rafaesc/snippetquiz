package ai.snippetquiz.core_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SnippetQuiz Core Service API")
                        .description("API documentation for SnippetQuiz Core Service")
                        .version("0.0.1-SNAPSHOT")
                        .contact(new Contact()
                                .name("SnippetQuiz Team")
                                .email("support@snippetquiz.ai")))
                .servers(List.of(
                        new Server().url("http://localhost:7001/api").description("Local server"),
                        new Server().url("https://api.snippetquiz.ai/api").description("Production server")));
    }
}