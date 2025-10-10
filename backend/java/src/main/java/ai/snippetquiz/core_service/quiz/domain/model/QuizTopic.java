package ai.snippetquiz.core_service.quiz.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopic {
    private Long id;
    private Quiz quiz;
    private String topicName;

    public QuizTopic(Quiz quiz, String topicName) {
        this.quiz = quiz;
        this.topicName = topicName;
    }
}