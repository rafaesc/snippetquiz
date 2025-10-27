package ai.snippetquiz.core_service.quiz.application.findresponses;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

@AllArgsConstructor
@Getter
public class FindQuizResponsesQuery implements Query {
    private final UUID userId;
    private final UUID quizId;
    private final Pageable pageable;
}