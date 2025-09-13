package ai.snippetquiz.core_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_topics", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"quiz_id", "topic_name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "topic_name", nullable = false)
    private String topicName;

    public QuizTopic(Quiz quiz, String topicName) {
        this.quiz = quiz;
        this.topicName = topicName;
    }
}