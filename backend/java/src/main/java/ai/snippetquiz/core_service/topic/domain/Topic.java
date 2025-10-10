package ai.snippetquiz.core_service.topic.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Topic {
    private Long id;
    private UUID userId;
    private String topic;
    private LocalDateTime createdAt;

    public Topic(UUID userId, String topic) {
        this.userId = userId;
        this.topic = topic;
    }
}