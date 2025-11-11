package ai.snippetquiz.core_service.shared.domain.valueobject;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

public class UserId extends BaseId<UUID> {
    public UserId(UUID value) {
        super(value);
    }
    public static UserId map(String value) {
        return new UserId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return getValue().toString();
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static UserId fromJson(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isTextual()) {
            return new UserId(UUID.fromString(node.asText()));
        }
        if (node.has("value")) {
            JsonNode v = node.get("value");
            if (v.isTextual()) {
                return new UserId(UUID.fromString(v.asText()));
            }
        }
        throw new IllegalArgumentException("Invalid UserId JSON: " + node.toString());
    }

    @JsonValue
    public UUID jsonValue() {
        return getValue();
    }
}
