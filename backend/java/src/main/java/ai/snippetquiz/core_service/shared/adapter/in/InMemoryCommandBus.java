package ai.snippetquiz.core_service.shared.adapter.in;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandBus;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandlerExecutionError;

@Service
@SuppressWarnings("rawtypes")
public class InMemoryCommandBus implements CommandBus {
    private final CommandHandlersInformation information;
    private final ApplicationContext context;

    public InMemoryCommandBus(CommandHandlersInformation information, ApplicationContext context) {
        this.information = information;
        this.context = context;
    }

    @SuppressWarnings("unchecked")
    @Override
    public void dispatch(Command command) throws CommandHandlerExecutionError {
        try {
            Class<? extends CommandHandler> commandHandlerClass = information.search(command.getClass());

            var handler = context.getBean(commandHandlerClass);

            handler.handle(command);
        } catch (Throwable error) {
            throw new CommandHandlerExecutionError(error);
        }
    }
}
