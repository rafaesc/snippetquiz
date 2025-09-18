package ai.snippetquiz.core_service.entity;

public enum QuizStatus {
    READY("READY"),
    READY_WITH_ERROR("READY_WITH_ERROR"),
    IN_PROGRESS("IN_PROGRESS"),
    PREPARE("PREPARE"),;

    private final String value;

    QuizStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
