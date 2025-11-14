package ai.snippetquiz.core_service.topic.domain;

import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import ai.snippetquiz.core_service.topic.domain.valueobject.TopicId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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

    public Topic(UserId userId, String topic) {
        this.userId = userId;
        this.topic = topic;
    }
}