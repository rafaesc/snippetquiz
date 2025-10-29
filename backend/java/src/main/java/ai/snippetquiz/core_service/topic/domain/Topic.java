package ai.snippetquiz.core_service.topic.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonSerialize
public class Topic {
    private Long id;
    private UUID userId;
    private String topic;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public Topic(UUID userId, String topic) {
        this.userId = userId;
        this.topic = topic;
    }

    public static String toJson(Set<Topic> entries) {
        try {
            return objectMapper.writeValueAsString(entries);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing Topic list", e);
        }
    }
}