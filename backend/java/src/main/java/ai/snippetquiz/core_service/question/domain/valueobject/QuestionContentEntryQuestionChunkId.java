package ai.snippetquiz.core_service.question.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper=true)
@JsonSerialize
public class QuestionContentEntryQuestionChunkId extends BaseId<Integer> {
    @JsonCreator
    public QuestionContentEntryQuestionChunkId(@JsonProperty("value") Integer value) {
        super(value);
    }
}
