import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class ContentEntryTopicAddedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'content_entry.updated';

    readonly topics: string[];
    readonly status: string;
    readonly updatedAt: Date;

    constructor(
        aggregateId: string,
        userId: string,
        topics: string[],
        status: string,
        updatedAt: Date,
        eventId: string,
        occurredOn?: string,
    ) {
        super(
            ContentEntryTopicAddedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
        this.topics = topics;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    toPrimitives(): DomainEventAttributes {
        throw new Error('Not implemented');
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): ContentEntryTopicAddedEvent {
        return new ContentEntryTopicAddedEvent(
            body.aggregate_id,
            body.user_id,
            body.topics,
            body.status,
            new Date(body.updated_at),
            eventId,
            occurredOn,
        );
    }
}
