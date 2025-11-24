package ai.snippetquiz.core_service.shared.domain.bus.event;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.Utils;
import lombok.Getter;
import lombok.Setter;

import static java.time.ZoneOffset.UTC;

public abstract class BaseEvent {
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
    private Integer version;

    protected BaseEvent(UUID aggregateId, UUID userId) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = UUID.randomUUID();
        this.occurredOn = Utils.dateToString(LocalDateTime.now(UTC));
        this.version = -1;
    }

    protected BaseEvent(
            UUID aggregateId,
            UUID userId,
            UUID eventId,
            String occurredOn,
            Integer version
    ) {
        this.aggregateId = aggregateId;
        this.userId = userId;
        this.eventId = eventId;
        this.occurredOn = occurredOn;
        this.version = version;
    }

    protected BaseEvent() {
    }

    public abstract BaseEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version
    );
}