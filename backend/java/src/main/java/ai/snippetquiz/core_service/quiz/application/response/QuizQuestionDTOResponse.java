package ai.snippetquiz.core_service.quiz.application.response;

import java.util.List;

public record QuizQuestionDTOResponse(
    Long id,
    String question,
    List<QuizQuestionOptionDTOResponse> options
) {}
