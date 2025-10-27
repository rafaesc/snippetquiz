package ai.snippetquiz.core_service.quiz.application.create;

import ai.snippetquiz.core_service.contentbank.domain.valueobject.ContentBankId;
import ai.snippetquiz.core_service.quiz.application.service.QuizService;
import ai.snippetquiz.core_service.quiz.domain.valueobject.QuizId;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CreateQuizCommandHandler implements CommandHandler<CreateQuizCommand> {
    private final QuizService quizService;

    @Override
    public void handle(CreateQuizCommand command) {
        quizService.createQuiz(
                new UserId(command.getUserId()),
                new ContentBankId(command.getContentBankId()),
                new QuizId(command.getQuizId())
        );
    }
}
