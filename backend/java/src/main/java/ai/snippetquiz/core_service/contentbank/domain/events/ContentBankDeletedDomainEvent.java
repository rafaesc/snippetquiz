package ai.snippetquiz.core_service.contentbank.domain.events;

import java.util.HashMap;
import java.util.UUID;

import ai.snippetquiz.core_service.shared.domain.bus.event.DeactivationDomainEvent;
import ai.snippetquiz.core_service.shared.domain.bus.event.DomainEvent;
import ai.snippetquiz.core_service.shared.domain.valueobject.UserId;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ContentBankDeletedDomainEvent extends DomainEvent implements DeactivationDomainEvent {

    public ContentBankDeletedDomainEvent(UUID aggregateId, UserId userId) {
        super(aggregateId, userId.getValue());
    }

    public ContentBankDeletedDomainEvent(
            UUID aggregateId,
            UserId userId,
            UUID eventId,
            String occurredOn,
            Integer version) {
        super(aggregateId, userId.getValue(), eventId, occurredOn, version);
    }

    public static String eventName() {
        return "content_bank.deleted";
    }

    @Override
    public HashMap<String, Object> toPrimitives() {
        return new HashMap<>();
    }

    @Override
    public ContentBankDeletedDomainEvent fromPrimitives(
            UUID aggregateId,
            UUID userId,
            HashMap<String, Object> body,
            UUID eventId,
            String occurredOn,
            Integer version) {
        return new ContentBankDeletedDomainEvent(
                aggregateId,
                new UserId(userId),
                eventId,
                occurredOn,
                version);
    }
}
