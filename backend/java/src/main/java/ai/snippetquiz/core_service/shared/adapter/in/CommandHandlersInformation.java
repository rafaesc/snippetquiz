package ai.snippetquiz.core_service.shared.adapter.in;

import java.lang.reflect.ParameterizedType;
import java.util.HashMap;
import java.util.Set;

import org.reflections.Reflections;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandler;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandNotRegisteredError;

@Service
@SuppressWarnings("rawtypes")
public final class CommandHandlersInformation {
    HashMap<Class<? extends Command>, Class<? extends CommandHandler<?>>> indexedCommandHandlers;

    public CommandHandlersInformation() {
        Reflections reflections = new Reflections("ai.snippetquiz.core_service");

        Set<Class<? extends CommandHandler>> classes = reflections.getSubTypesOf(CommandHandler.class);

        indexedCommandHandlers = formatHandlers(classes);
    }

    public Class<? extends CommandHandler<?>> search(Class<? extends Command> commandClass)
            throws CommandNotRegisteredError {
        Class<? extends CommandHandler<?>> commandHandlerClass = indexedCommandHandlers.get(commandClass);

        if (null == commandHandlerClass) {
            throw new CommandNotRegisteredError(commandClass);
        }

        return commandHandlerClass;
    }

    @SuppressWarnings("unchecked")
    private HashMap<Class<? extends Command>, Class<? extends CommandHandler<?>>> formatHandlers(
            Set<Class<? extends CommandHandler>> commandHandlers) {
        HashMap<Class<? extends Command>, Class<? extends CommandHandler<?>>> handlers = new HashMap<>();

        for (var handler : commandHandlers) {
            ParameterizedType paramType = (ParameterizedType) handler.getGenericInterfaces()[0];
            Class<? extends Command> commandClass = (Class<? extends Command>) paramType.getActualTypeArguments()[0];

            handlers.put(commandClass, (Class<? extends CommandHandler<?>>) handler);
        }

        return handlers;
    }
}
