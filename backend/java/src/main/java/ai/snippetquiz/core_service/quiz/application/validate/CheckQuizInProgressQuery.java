package ai.snippetquiz.core_service.quiz.application.validate;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;

@AllArgsConstructor
@Getter
public class CheckQuizInProgressQuery implements Query {
    private final UUID userId;
}