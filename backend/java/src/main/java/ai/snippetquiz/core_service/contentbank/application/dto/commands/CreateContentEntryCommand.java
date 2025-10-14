package ai.snippetquiz.core_service.contentbank.application.dto.commands;

import ai.snippetquiz.core_service.shared.cqrs.commands.BaseCommand;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=false)
public class CreateContentEntryCommand extends BaseCommand {
    
}
