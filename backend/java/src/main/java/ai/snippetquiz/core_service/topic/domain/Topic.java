package ai.snippetquiz.core_service.topic.domain;

import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonSerialize
public class Topic extends BaseEntity<TopicId> {
    private UserId userId;
    private String topic;
    private LocalDateTime createdAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public Topic(UserId userId, String topic) {
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