package ai.snippetquiz.core_service.quiz.domain.model;

import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopic {
    private Long id;
    private QuizId quizId;
    private String topicName;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public QuizTopic(QuizId quizId, String topicName) {
        this.quizId = quizId;
        this.topicName = topicName;
    }

    public static String toJson(Set<QuizTopic> entries) {
        try {
            return objectMapper.writeValueAsString(entries);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing QuizTopic list", e);
        }
    }

    public static Set<QuizTopic> fromJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Set<QuizTopic>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing QuizTopic list", e);
        }
    }
}