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
    private UUID aggregateId;
    @Getter
    private UUID userId;
    @Getter
    private UUID eventId;
    @Getter
    @Setter
    private String occurredOn;
    @Getter
    @Setter
    private int version;

    public DomainEvent(UUID aggregateId, UUID userId) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = UUID.randomUUID();
        this.occurredOn = Utils.dateToString(LocalDateTime.now(UTC));
    }

    public DomainEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
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
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            int version);
}
