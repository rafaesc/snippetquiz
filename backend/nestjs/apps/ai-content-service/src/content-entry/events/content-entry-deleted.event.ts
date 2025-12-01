import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class ContentEntryDeletedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'content_entry.deleted';

    constructor(
        aggregateId: string,
        userId: string,
        eventId: string,
        occurredOn?: string,
    ) {
        super(
            ContentEntryDeletedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
    }

    toPrimitives(): DomainEventAttributes {
        throw new Error('Not implemented');
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): ContentEntryDeletedEvent {
        return new ContentEntryDeletedEvent(
            body.aggregate_id,
            body.user_id,
            eventId,
            occurredOn,
        );
    }
}
