package ai.snippetquiz.core_service.shared.domain.exception;

public class ConcurrencyException extends RuntimeException {
    public ConcurrencyException() {
        super();
    }

    public ConcurrencyException(String message) {
        super(message);
    }

    public ConcurrencyException(String message, Throwable cause) {
        super(message, cause);
    }

    public ConcurrencyException(Throwable cause) {
        super(cause);
    }
}
