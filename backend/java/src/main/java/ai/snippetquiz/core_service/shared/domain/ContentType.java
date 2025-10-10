package ai.snippetquiz.core_service.shared.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ContentType {
    SELECTED_TEXT("selected_text"),
    FULL_HTML("full_html"),
    VIDEO_TRANSCRIPT("video_transcript");

    private final String value;

    public static ContentType fromValue(String value) {
        for (ContentType type : ContentType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown content type: " + value);
    }
}
