import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class QuizCreatedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'quiz.created';

    readonly contentBankId: string;
    readonly bankName: string;
    readonly status: string;
    readonly createdAt: Date;
    readonly instructions: string;
    readonly newContentEntries: string[];
    readonly entriesSkipped: number;

    constructor(
        aggregateId: string,
        userId: string,
        contentBankId: string,
        bankName: string,
        status: string,
        createdAt: Date,
        instructions: string,
        newContentEntries: string[],
        entriesSkipped: number,
        eventId?: string,
        occurredOn?: string,
    ) {
        super(
            QuizCreatedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
        this.contentBankId = contentBankId;
        this.bankName = bankName;
        this.status = status;
        this.createdAt = createdAt;
        this.instructions = instructions;
        this.newContentEntries = newContentEntries;
        this.entriesSkipped = entriesSkipped;
    }

    toPrimitives(): DomainEventAttributes {
        return {
            content_bank_id: this.contentBankId,
            bank_name: this.bankName,
            status: this.status,
            created_at: this.createdAt.toISOString(),
            instructions: this.instructions,
            new_content_entries: this.newContentEntries,
            entries_skipped: this.entriesSkipped,
            aggregate_id: this.aggregateId,
            user_id: this.userId,
        };
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): QuizCreatedEvent {
        return new QuizCreatedEvent(
            body.aggregate_id,
            body.user_id,
            body.content_bank_id,
            body.bank_name,
            body.status,
            new Date(body.created_at),
            body.instructions,
            body.new_content_entries,
            body.entries_skipped,
            eventId,
            occurredOn,
        );
    }
}
