package ai.snippetquiz.core_service.quiz.adapter.out.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private QuizEntity quiz;

    @Column(name = "topic_name", nullable = false)
    private String topicName;

    public QuizTopicEntity(QuizEntity quiz, String topicName) {
        this.quiz = quiz;
        this.topicName = topicName;
    }
}