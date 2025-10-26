package ai.snippetquiz.core_service.contentbank.adapter.out.entities;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "content_entry_topics", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"content_entry_id", "topic_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentEntryTopicEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_entry_id", nullable = false)
    private UUID contentEntryId;

    @Column(name = "topic_id", nullable = false)
    private Long topicId;

    public ContentEntryTopicEntity(UUID contentEntryId, Long topicId) {
        this.contentEntryId = contentEntryId;
        this.topicId = topicId;
    }
}