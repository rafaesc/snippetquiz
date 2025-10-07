package ai.snippetquiz.core_service.before.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record QuizResponse(
    Long id,
    String name,
    LocalDateTime createdAt,
    Integer questionsCount,
    Integer questionsCompleted,
    String status,
    Integer contentEntriesCount,
    List<String> topics
) {}