package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.Getter;
import lombok.Setter;

import static java.time.ZoneOffset.UTC;

public abstract class DomainEvent {
    @Getter
    private String aggregateId;
    @Getter
    private String userId;
    @Getter
    private String eventId;
    @Getter
    @Setter
    private String occurredOn;
    @Getter
    @Setter
    private int version;

    public DomainEvent(String aggregateId, String userId) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = UUID.randomUUID().toString();
        this.occurredOn = Utils.dateToString(LocalDateTime.now(UTC));
    }

    public DomainEvent(
            String aggregateId,
            String userId,
            String eventId,
            String occurredOn,
            int version
    ) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = eventId;
        this.occurredOn = occurredOn;
        this.version = version;
    }

    protected DomainEvent() {
    }

    public abstract HashMap<String, Serializable> toPrimitives();

    public abstract DomainEvent fromPrimitives(
            String aggregateId,
            String userId,
            HashMap<String, Serializable> body,
            String eventId,
            String occurredOn,
            int version);
}
