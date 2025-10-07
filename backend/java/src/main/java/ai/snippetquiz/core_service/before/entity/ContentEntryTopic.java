package ai.snippetquiz.core_service.before.entity;

import jakarta.persistence.*;
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
public class ContentEntryTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_entry_id", nullable = false)
    private ContentEntry contentEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    public ContentEntryTopic(ContentEntry contentEntry, Topic topic) {
        this.contentEntry = contentEntry;
        this.topic = topic;
    }
}