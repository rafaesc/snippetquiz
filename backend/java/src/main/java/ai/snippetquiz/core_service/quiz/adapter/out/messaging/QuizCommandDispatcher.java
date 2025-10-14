package ai.snippetquiz.core_service.quiz.adapter.out.messaging;

import ai.snippetquiz.core_service.shared.adapter.in.CommandDispatcher;
import ai.snippetquiz.core_service.shared.cqrs.commands.BaseCommand;
import ai.snippetquiz.core_service.shared.cqrs.commands.CommandHandlerMethod;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;

@Service
public class QuizCommandDispatcher implements CommandDispatcher {

    private final Map<Class<? extends BaseCommand>, List<CommandHandlerMethod<? extends BaseCommand>>> routes = new HashMap<>();

    @Override
    public <T extends BaseCommand> void registerHandler(Class<T> type, CommandHandlerMethod<T> handler) {
        var handlers = routes.computeIfAbsent(type, c -> new LinkedList<>());
        handlers.add(handler);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T extends BaseCommand> void send(T command) {
        var handlers = routes.get(command.getClass());
        if (Objects.isNull(handlers) || handlers.size() == 0) {
            throw new RuntimeException("No command handler was registered!");
        }
        if (handlers.size() > 1) {
            throw new RuntimeException("Cannot send command to more than one handler!");
        }
        var handler = (CommandHandlerMethod<T>) handlers.get(0);
        handler.handle(command);

    }
}
