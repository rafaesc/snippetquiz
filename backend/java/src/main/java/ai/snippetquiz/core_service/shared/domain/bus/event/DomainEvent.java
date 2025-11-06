package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.Getter;

public abstract class DomainEvent {
    @Getter
    private String aggregateId;
    @Getter
    private String userId;
    private String eventId;
    @Getter
    private String occurredOn;

    public DomainEvent(String aggregateId, String userId) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = UUID.randomUUID().toString();
        this.occurredOn = Utils.dateToString(LocalDateTime.now());
    }

    public DomainEvent(String aggregateId, String userId, String eventId, String occurredOn) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = eventId;
        this.occurredOn = occurredOn;
    }

    protected DomainEvent() {
    }

    public abstract String eventName();

    public abstract HashMap<String, Serializable> toPrimitives();

    public abstract DomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn);

    public String aggregateId() {
        return aggregateId;
    }

    public String eventId() {
        return eventId;
    }

    public String occurredOn() {
        return occurredOn;
    }
}
