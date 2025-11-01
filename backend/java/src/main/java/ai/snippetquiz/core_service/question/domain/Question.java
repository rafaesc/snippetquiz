package ai.snippetquiz.core_service.question.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentEntryId;
import ai.snippetquiz.core_service.question.domain.valueobject.QuestionId;
import ai.snippetquiz.core_service.shared.domain.entity.BaseEntity;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonSerialize
public class Question extends BaseEntity<QuestionId> {
    private String question;
    private String type;
    private Integer chunkIndex;
    private Integer questionIndexInChunk;
    private ContentEntryId contentEntryId;
    private LocalDateTime createdAt;
    private List<QuestionOption> questionOptions = List.of();

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String toJson(List<Question> questions) {
        try {
            return objectMapper.writeValueAsString(questions);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing Question list", e);
        }
    }

    public static List<Question> fromJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Question>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing Question list", e);
        }
    }
}