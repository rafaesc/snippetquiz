package ai.snippetquiz.core_service.quiz.application.delete;

import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DeleteQuizCommandHandler implements CommandHandler<DeleteQuizCommand> {
    private final QuizService quizService;

    @Override
    public void handle(DeleteQuizCommand command) {
        quizService.delete(
                new UserId(command.getUserId()),
                new QuizId(command.getQuizId())
        );
    }
}
