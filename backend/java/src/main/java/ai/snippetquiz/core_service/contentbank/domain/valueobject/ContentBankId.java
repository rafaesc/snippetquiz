package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

public class ContentBankId extends BaseId<UUID> {
    public ContentBankId(UUID value) {
        super(value);
    }
    public static ContentBankId map(String value) {
        return new ContentBankId(UUID.fromString(value));
    }

    public static ContentBankId create() {
        return new ContentBankId(UUID.randomUUID());
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static ContentBankId fromJson(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return new ContentBankId(UUID.fromString(node.asText()));
        }
        if (node.has("value")) {
            JsonNode v = node.get("value");
            if (v.isTextual()) {
                return new ContentBankId(UUID.fromString(v.asText()));
            }
        }
        throw new IllegalArgumentException("Invalid ContentBankId JSON: " + node.toString());
    }

    @JsonValue
    public UUID jsonValue() {
        return getValue();
    }

    @Override
    public String toString() {
        return getValue().toString();
    }
}
