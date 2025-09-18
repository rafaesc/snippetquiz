package ai.snippetquiz.core_service.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record FindOneQuizResponse(
    String id,
    String name,
    LocalDateTime createdAt,
    Integer totalQuestions,
    Integer questionsCompleted,
    String status,
    Integer contentEntriesCount,
    List<String> topics,
    QuizQuestionDTOResponse question
) {}