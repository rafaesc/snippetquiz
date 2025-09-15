package ai.snippetquiz.core_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FindQuizResponsesRequest extends PaginationRequest {
    @NotNull(message = "Quiz ID cannot be null")
    @Positive(message = "Quiz ID must be positive")
    private String quizId;
}