import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class AIContentEntryTopicsGeneratedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'ai-content-service.topics.added';

    readonly contentBankId: string;
    readonly topics: string[];


    constructor(
        aggregateId: string,
        userId: string,
        contentBankId: string,
        topics: string[],
        eventId?: string,
        occurredOn?: string,
    ) {
        super(
            AIContentEntryTopicsGeneratedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
        this.contentBankId = contentBankId;
        this.topics = topics;
    }

    toPrimitives(): DomainEventAttributes {
        return {
            content_bank_id: this.contentBankId,
            topics: this.topics,
            aggregate_id: this.aggregateId,
            user_id: this.userId,
        };
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): AIContentEntryTopicsGeneratedEvent {
        return new AIContentEntryTopicsGeneratedEvent(
            body.aggregate_id,
            body.user_id,
            body.content_bank_id,
            body.topics,
            eventId,
            occurredOn,
        );
    }
}
