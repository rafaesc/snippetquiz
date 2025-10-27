package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopic {
    private Long id;
    private QuizId quizId;
    private String topicName;

    public QuizTopic(QuizId quizId, String topicName) {
        this.quizId = quizId;
        this.topicName = topicName;
    }
}