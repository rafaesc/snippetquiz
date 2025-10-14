package ai.snippetquiz.core_service.shared.adapter.in;

import ai.snippetquiz.core_service.shared.cqrs.commands.BaseCommand;
import ai.snippetquiz.core_service.shared.cqrs.commands.CommandHandlerMethod;

public interface CommandDispatcher {
    <T extends BaseCommand> void registerHandler(Class<T> type, CommandHandlerMethod<T> handler);
    <T extends BaseCommand> void send(T command);
}

