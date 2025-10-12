package ai.snippetquiz.core_service.quiz.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopic {
    private Long id;
    private Long quizId;
    private String topicName;

    public QuizTopic(Long quizId, String topicName) {
        this.quizId = quizId;
        this.topicName = topicName;
    }
}