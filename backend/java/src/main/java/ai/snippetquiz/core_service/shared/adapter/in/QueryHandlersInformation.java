package ai.snippetquiz.core_service.shared.adapter.in;

import java.lang.reflect.ParameterizedType;
import java.util.HashMap;
import java.util.Set;

import org.reflections.Reflections;
import org.springframework.stereotype.Service;

import ai.snippetquiz.core_service.shared.domain.bus.query.Query;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryHandler;
import ai.snippetquiz.core_service.shared.domain.bus.query.QueryNotRegisteredError;

@Service
@SuppressWarnings("rawtypes")
public final class QueryHandlersInformation {
    HashMap<Class<? extends Query>, Class<? extends QueryHandler>> indexedQueryHandlers;

    public QueryHandlersInformation() {
        Reflections reflections = new Reflections("ai.snippetquiz.core_service");
        Set<Class<? extends QueryHandler>> classes = reflections.getSubTypesOf(QueryHandler.class);

        indexedQueryHandlers = formatHandlers(classes);
    }

    public Class<? extends QueryHandler> search(Class<? extends Query> queryClass) throws QueryNotRegisteredError {
        Class<? extends QueryHandler> queryHandlerClass = indexedQueryHandlers.get(queryClass);

        if (null == queryHandlerClass) {
            throw new QueryNotRegisteredError(queryClass);
        }

        return queryHandlerClass;
    }

    @SuppressWarnings("unchecked")
    private HashMap<Class<? extends Query>, Class<? extends QueryHandler>> formatHandlers(
            Set<Class<? extends QueryHandler>> queryHandlers) {
        HashMap<Class<? extends Query>, Class<? extends QueryHandler>> handlers = new HashMap<>();

        for (Class<? extends QueryHandler> handler : queryHandlers) {
            ParameterizedType paramType = (ParameterizedType) handler.getGenericInterfaces()[0];
            Class<? extends Query> queryClass = (Class<? extends Query>) paramType.getActualTypeArguments()[0];

            handlers.put(queryClass, handler);
        }

        return handlers;
    }
}
