package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.UUID;

@JsonSerialize
public class QuizQuestionId extends BaseId<UUID> {
    @JsonCreator
    public QuizQuestionId(@JsonProperty("value") UUID value) {
        super(value);
    }
    public static QuizQuestionId map(String value) {
        return new QuizQuestionId(UUID.fromString(value));
    }
    
    @Override
    public String toString() {
        return getValue().toString();
    }
}
