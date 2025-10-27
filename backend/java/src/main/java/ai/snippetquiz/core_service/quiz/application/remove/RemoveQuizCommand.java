package ai.snippetquiz.core_service.quiz.application.remove;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class RemoveQuizCommand implements Command {
    private final UUID userId;
    private final UUID quizId;
}
