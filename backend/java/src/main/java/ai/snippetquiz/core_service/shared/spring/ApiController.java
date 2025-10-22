package ai.snippetquiz.core_service.shared.spring;

import java.util.HashMap;

import org.springframework.http.HttpStatus;

import ai.snippetquiz.core_service.shared.domain.DomainError;
import ai.snippetquiz.core_service.shared.domain.bus.command.Command;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandBus;
import ai.snippetquiz.core_service.shared.domain.bus.command.CommandHandlerExecutionError;
import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandlerExecutionError;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public abstract class ApiController {
    private final QueryBus queryBus;
    private final CommandBus commandBus;

    protected void dispatch(Command command) throws CommandHandlerExecutionError {
        commandBus.dispatch(command);
    }

    protected <R> R ask(Query query) throws QueryHandlerExecutionError {
        return queryBus.ask(query);
    }

    abstract public HashMap<Class<? extends DomainError>, HttpStatus> errorMapping();
}
