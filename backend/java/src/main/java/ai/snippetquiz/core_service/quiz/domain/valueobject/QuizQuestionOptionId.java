package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.UUID;

@JsonSerialize
public class QuizQuestionOptionId extends BaseId<UUID> {
    @JsonCreator
    public QuizQuestionOptionId(@JsonProperty("value") UUID value) {
        super(value);
    }
    public static QuizQuestionOptionId map(String value) {
        return new QuizQuestionOptionId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return getValue().toString();
    }
}
