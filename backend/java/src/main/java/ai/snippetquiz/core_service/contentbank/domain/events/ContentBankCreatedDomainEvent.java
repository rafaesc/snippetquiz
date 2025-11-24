package ai.snippetquiz.core_service.contentbank.domain.events;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.Utils;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBankCreatedDomainEvent extends DomainEvent {
    private String name;
    private LocalDateTime createdAt;

    public ContentBankCreatedDomainEvent(UUID aggregateId, UserId userId, String name, LocalDateTime createdAt) {
        super(aggregateId, userId.getValue());
        this.name = name;
        this.createdAt = createdAt;
    }

    public ContentBankCreatedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String name,
            LocalDateTime createdAt) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.name = name;
        this.createdAt = createdAt;
    }

    public static String eventName() {
        return "content_bank.created";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        var primitives = new HashMap<String, Object>();
        primitives.put("name", name);
        primitives.put("created_at", Utils.dateToString(createdAt));
        return primitives;
    }

    @Override
    public ContentBankCreatedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new ContentBankCreatedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("name"),
                Utils.stringToDate((String) body.get("created_at")));
    }
}
