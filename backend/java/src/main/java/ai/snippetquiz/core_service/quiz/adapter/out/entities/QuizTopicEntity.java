package ai.snippetquiz.core_service.quiz.adapter.out.entities;

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
@Table(name = "quiz_topics", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"quiz_id", "topic_name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopicEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "topic_name", nullable = false)
    private String topicName;

    public QuizTopicEntity(Long quizId, String topicName) {
        this.quizId = quizId;
        this.topicName = topicName;
    }
}