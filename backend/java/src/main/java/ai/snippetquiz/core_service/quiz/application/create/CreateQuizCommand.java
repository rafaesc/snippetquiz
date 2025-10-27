package ai.snippetquiz.core_service.quiz.application.create;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@AllArgsConstructor
@Getter
public class CreateQuizCommand implements Command {
    private final UUID userId;
    private final UUID contentBankId;
    private final UUID quizId;
}
