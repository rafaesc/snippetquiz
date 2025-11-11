package ai.snippetquiz.core_service.contentbank.domain.valueobject;

import ai.snippetquiz.core_service.shared.domain.valueobject.BaseId;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import com.fasterxml.jackson.databind.JsonNode;

public class YoutubeChannelId extends BaseId<Long> {
    public YoutubeChannelId(Long value) {
        super(value);
    }
    public static YoutubeChannelId map(Long value) {
        return new YoutubeChannelId(value);
    }

    @JsonCreator(mode = JsonCreator.Mode.DELEGATING)
    public static YoutubeChannelId fromJson(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        // Accept numeric nodes directly
        if (node.isNumber()) {
            return new YoutubeChannelId(node.longValue());
        }
        if (node.isTextual()) {
            return new YoutubeChannelId(Long.valueOf(node.asText()));
        }
        if (node.has("value")) {
            JsonNode v = node.get("value");
            // Accept numeric inside "value"
            if (v.isNumber()) {
                return new YoutubeChannelId(v.longValue());
            }
            if (v.isTextual()) {
                return new YoutubeChannelId(Long.valueOf(v.asText()));
            }
        }
        throw new IllegalArgumentException("Invalid YoutubeChannelId JSON: " + node.toString());
    }

    @JsonValue
    public Long jsonValue() {
        return getValue();
    }
}