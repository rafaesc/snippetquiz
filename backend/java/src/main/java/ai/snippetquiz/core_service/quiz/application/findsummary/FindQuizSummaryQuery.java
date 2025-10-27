package ai.snippetquiz.core_service.quiz.application.findsummary;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;

@AllArgsConstructor
@Getter
public class FindQuizSummaryQuery implements Query {
    private final UUID userId;
    private final UUID quizId;
}