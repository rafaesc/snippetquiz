import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
    readonly aggregateId: string;
    readonly eventId: string;
    readonly occurredOn: string;
    readonly eventName: string;
    readonly userId: string;
    readonly meta: Record<string, any>;

    constructor(
        eventName: string,
        aggregateId: string,
        userId: string,
        eventId?: string,
        occurredOn?: string,
        meta: Record<string, any> = {},
    ) {
        this.aggregateId = aggregateId;
        this.eventId = eventId || uuidv4();
        this.occurredOn = occurredOn || new Date().toISOString();
        this.eventName = eventName;
        this.userId = userId;
        this.meta = meta;
    }

    abstract toPrimitives(): DomainEventAttributes;

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): DomainEvent {
        throw new Error('Method not implemented.');
    }
}

export type DomainEventAttributes = {
    aggregate_id: string;
    user_id: string;
    [key: string]: any;
};

export interface DomainEventEnvelope {
    data: {
        event_id: string;
        version?: number;
        type: string;
        occurred_on: string;
        attributes: DomainEventAttributes;
    };
    meta: Record<string, any>;
}
