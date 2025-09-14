package ai.snippetquiz.core_service.dto.response;

import java.util.List;

public record QuizQuestionDTOResponse(
    String id,
    String question,
    List<QuizQuestionOptionDTOResponse> options
) {}
