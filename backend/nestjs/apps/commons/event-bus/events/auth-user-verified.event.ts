import { DomainEvent, DomainEventAttributes } from '../domain-event';

export class AuthUserVerifiedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'auth.user.verified';

    constructor(
        aggregateId: string,
        eventId?: string,
        occurredOn?: string,
    ) {
        super(
            AuthUserVerifiedEvent.EVENT_NAME,
            aggregateId,
            aggregateId, // userId is the same as aggregateId
            eventId,
            occurredOn,
        );
    }

    toPrimitives(): DomainEventAttributes {
        return {
            aggregate_id: this.aggregateId,
            user_id: this.userId,
        };
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): AuthUserVerifiedEvent {
        return new AuthUserVerifiedEvent(
            body.aggregate_id,
            eventId,
            occurredOn,
        );
    }
}
