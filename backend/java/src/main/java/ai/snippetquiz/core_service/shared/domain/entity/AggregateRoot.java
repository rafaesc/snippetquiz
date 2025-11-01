package ai.snippetquiz.core_service.shared.domain.entity;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import lombok.Getter;
import lombok.Setter;

public abstract class AggregateRoot<ID> extends BaseEntity<ID> {
    @Getter
    @Setter
    private int version = -1;
    private boolean active = true;
    private List<DomainEvent> domainEvents = new ArrayList<>();
    private final Logger logger = Logger.getLogger(AggregateRoot.class.getName());

    protected void deactivate() {
        this.active = false;
    }

    final public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = domainEvents;

        domainEvents = Collections.emptyList();

        return events;
    }

    final protected void record(DomainEvent event) {
        applyChange(event, true);
    }

    final protected void applyChange(DomainEvent event, Boolean isNewEvent) {
        ensureActive(event);
        try {
            var method = getClass().getDeclaredMethod("apply", event.getClass());
            method.setAccessible(true);
            method.invoke(this, event);
        } catch (NoSuchMethodException e) {
            logger.log(Level.WARNING, MessageFormat.format("The apply method was not found in the aggregate for {0}", event.getClass().getName()));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error applying event to aggregate", e);
        } finally {
            if (isNewEvent) {
                domainEvents.add(event);
            }
        }
    }

    // TODO: load from Snapshot for commands that require bulk operations
    
    public void replayEvents(Iterable<DomainEvent> events) {
        events.forEach(event -> applyChange(event, false));
    }

    public List<DomainEvent> getUncommittedChanges() {
        return this.domainEvents;
    }

    public void markChangesAsCommitted() {
        this.domainEvents.clear();
    }

    protected void ensureActive(DomainEvent event) {
        if (!active && !(event instanceof DeactivationDomainEvent)) {
            throw new IllegalStateException("Aggregate is inactive, cannot apply event");
        }
    }
}
