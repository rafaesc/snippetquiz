package ai.snippetquiz.core_service.contentbank.domain.events;

import java.io.Serializable;
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
public class ContentBankRenamedDomainEvent extends DomainEvent {
    private String name;
    private LocalDateTime updatedAt;

    public ContentBankRenamedDomainEvent(UUID aggregateId, UserId userId, String name, LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue());
        this.name = name;
        this.updatedAt = updatedAt;
    }

    public ContentBankRenamedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version,
            String name, LocalDateTime updatedAt) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
        this.name = name;
        this.updatedAt = updatedAt;
    }

    public static String eventName() {
        return "content_bank.renamed";
    }

    @Override
    public HashMap<String, Serializable> toPrimitives() {
        var primitives = new HashMap<String, Serializable>();
        primitives.put("name", name);
        primitives.put("updated_at", Utils.dateToString(updatedAt));
        return primitives;
    }

    @Override
    public ContentBankRenamedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Serializable> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new ContentBankRenamedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version,
                (String) body.get("name"),
                Utils.stringToDate((String) body.get("updated_at")));
    }
}
