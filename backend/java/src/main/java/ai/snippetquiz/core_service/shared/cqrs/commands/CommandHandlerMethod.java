package ai.snippetquiz.core_service.shared.cqrs.commands;

@FunctionalInterface
public interface CommandHandlerMethod<T extends BaseCommand> {
    void handle(T command);
}
