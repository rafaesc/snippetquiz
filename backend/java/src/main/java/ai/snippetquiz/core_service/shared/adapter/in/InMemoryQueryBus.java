package ai.snippetquiz.core_service.shared.adapter.in;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryBus;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandlerExecutionError;
import ai.snippetquiz.core_service.shared.domain.bus.query.Response;

@Service
@SuppressWarnings("rawtypes")
public class InMemoryQueryBus implements QueryBus {
    private final QueryHandlersInformation information;
    private final ApplicationContext context;

    public InMemoryQueryBus(QueryHandlersInformation information, ApplicationContext context) {
        this.information = information;
        this.context = context;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Response ask(Query query) throws QueryHandlerExecutionError {
        try {
            Class<? extends QueryHandler> queryHandlerClass = information.search(query.getClass());

            QueryHandler handler = context.getBean(queryHandlerClass);

            return handler.handle(query);
        } catch (Throwable error) {
            throw new QueryHandlerExecutionError(error);
        }
    }
}
