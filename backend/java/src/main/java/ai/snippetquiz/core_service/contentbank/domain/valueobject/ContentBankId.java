package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.UUID;

@JsonSerialize
public class ContentBankId extends BaseId<UUID> {
    @JsonCreator
    public ContentBankId(@JsonProperty("value") UUID value) {
        super(value);
    }
    public static ContentBankId map(String value) {
        return new ContentBankId(UUID.fromString(value));
    }

    public static ContentBankId create() {
        return new ContentBankId(UUID.randomUUID());
    }

    @Override
    public String toString() {
        return getValue().toString();
    }
}
