package ai.snippetquiz.core_service.quiz.application.dto.command;

import ai.snippetquiz.core_service.shared.cqrs.commands.BaseCommand;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
public class CreateQuizCommand extends BaseCommand {
    
}
