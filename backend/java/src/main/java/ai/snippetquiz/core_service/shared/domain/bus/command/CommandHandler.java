package ai.snippetquiz.core_service.shared.domain.bus.command;

public interface CommandHandler<T extends Command> {
    void handle(T command);
}
