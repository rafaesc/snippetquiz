package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.UUID;

@JsonSerialize
public class ContentEntryId extends BaseId<UUID> {
    @JsonCreator
    public ContentEntryId(@JsonProperty("value") UUID value) {
        super(value);
    }
    public static ContentEntryId map(String value) {
        return new ContentEntryId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return getValue().toString();
    }
}
