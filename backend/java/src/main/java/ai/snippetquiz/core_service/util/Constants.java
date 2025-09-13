package ai.snippetquiz.core_service.util;

public final class Constants {    
    // Header constants
    public static final String USER_ID_HEADER = "X-User-Id";
    
    // Pagination constants
    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_LIMIT = 10;
    public static final int MAX_LIMIT = 100;
    
    // Validation messages
    public static final String INVALID_USER_ID = "User ID is required";
    public static final String INVALID_CONTENT_BANK_ID = "Content Bank ID is required";
    public static final String CONTENT_BANK_NOT_FOUND = "Content Bank not found";
    public static final String UNAUTHORIZED_ACCESS = "Unauthorized access to content bank";
}