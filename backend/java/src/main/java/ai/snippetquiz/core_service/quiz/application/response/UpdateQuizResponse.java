package ai.snippetquiz.core_service.quiz.application.response;

import ai.snippetquiz.core_service.shared.domain.bus.query.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UpdateQuizResponse implements Response {
    private String message;
    private Boolean success;
    private Boolean completed;
    private String correctOptionId;
}