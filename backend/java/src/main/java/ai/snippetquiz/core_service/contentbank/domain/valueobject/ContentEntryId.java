package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.JsonNode;

public class ContentEntryId extends BaseId<UUID> {
    public ContentEntryId(UUID value) {
        super(value);
    }
    public static ContentEntryId map(String value) {
        return new ContentEntryId(UUID.fromString(value));
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static ContentEntryId fromJson(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return new ContentEntryId(UUID.fromString(node.asText()));
        }
        if (node.has("value")) {
            JsonNode v = node.get("value");
            if (v.isTextual()) {
                return new ContentEntryId(UUID.fromString(v.asText()));
            }
        }
        throw new IllegalArgumentException("Invalid ContentEntryId JSON: " + node.toString());
    }

    @JsonValue
    public UUID jsonValue() {
        return getValue();
    }
}
