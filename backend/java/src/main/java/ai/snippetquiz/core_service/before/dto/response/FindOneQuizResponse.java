package ai.snippetquiz.core_service.before.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record FindOneQuizResponse(
    Long id,
    String name,
    LocalDateTime createdAt,
    Integer totalQuestions,
    Integer questionsCompleted,
    String status,
    Integer contentEntriesCount,
    List<String> topics,
    QuizQuestionDTOResponse question
) {}