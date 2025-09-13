package ai.snippetquiz.core_service.entity;

public enum ContentType {
    SELECTED_TEXT("selected_text"),
    FULL_HTML("full_html"),
    VIDEO_TRANSCRIPT("video_transcript");

    private final String value;

    ContentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}