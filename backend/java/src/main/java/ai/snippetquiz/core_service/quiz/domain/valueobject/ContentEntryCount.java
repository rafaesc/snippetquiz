package ai.snippetquiz.core_service.quiz.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.CounterValue;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
public class ContentEntryCount extends CounterValue {
    @JsonCreator
    public ContentEntryCount(@JsonProperty("value") Integer value) {
        super(value);
    }
}
