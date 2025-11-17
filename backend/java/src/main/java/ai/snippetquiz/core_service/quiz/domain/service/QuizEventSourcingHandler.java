package ai.snippetquiz.core_service.quiz.domain.service;

import ai.snippetquiz.core_service.quiz.domain.model.Quiz;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.service.EventSourcingHandler;
import ai.snippetquiz.core_service.shared.domain.service.EventStore;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizEventSourcingHandler implements EventSourcingHandler<Quiz> {
    private final EventStore eventStore;

    @Override
    @Transactional
    public void save(Quiz aggregate) {
        String aggregateType = aggregate.aggregateType();
        eventStore.saveEvents(aggregate.getUserId(), aggregate.getId().getValue(), aggregateType, aggregate.pullUncommittedChanges(), aggregate.getVersion());
        aggregate.markChangesAsCommitted();
    }

    @Override
    public Optional<Quiz> getById(UserId userId, UUID aggregateId) {
        var eventStream = eventStore.getEvents(userId, aggregateId);

        if (eventStream == null || eventStream.isEmpty()) {
            return Optional.empty();
        }

        var aggregate = new Quiz();
        aggregate.replayEvents(eventStream);
        var latestVersion = eventStream.stream().map(DomainEvent::getVersion).max(Comparator.naturalOrder());
        aggregate.setVersion(latestVersion.get());

        return Optional.of(aggregate);
    }
}
