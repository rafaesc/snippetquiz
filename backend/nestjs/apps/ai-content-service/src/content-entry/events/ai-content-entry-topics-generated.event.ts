import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class AIContentEntryTopicsGeneratedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'ai-content-service.topics.added';

    readonly contentBankId: string;
    readonly topics: string[];
    readonly characterMessage?: string | null;
    readonly characterSpriteURL?: string | null;
    readonly characterSteps?: number | null;
    readonly characterAnimateTo?: number | null;
    readonly characterAnimateSeconds?: number | null;


    constructor(
        aggregateId: string,
        userId: string,
        contentBankId: string,
        topics: string[],
        characterMessage?: string | null,
        characterSpriteURL?: string | null,
        characterSteps?: number | null,
        characterAnimateTo?: number | null,
        characterAnimateSeconds?: number | null,
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
        this.characterMessage = characterMessage;
        this.characterSpriteURL = characterSpriteURL;
        this.characterSteps = characterSteps;
        this.characterAnimateTo = characterAnimateTo;
        this.characterAnimateSeconds = characterAnimateSeconds;
    }

    toPrimitives(): DomainEventAttributes {
        return {
            content_bank_id: this.contentBankId,
            topics: this.topics,
            character_message: this.characterMessage,
            character_sprite_url: this.characterSpriteURL,
            character_steps: this.characterSteps,
            character_animate_to: this.characterAnimateTo,
            character_animate_seconds: this.characterAnimateSeconds,
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
            body.character_message,
            body.character_sprite_url,
            body.character_steps,
            body.character_animate_to,
            body.character_animate_seconds,
            eventId,
            occurredOn,
        );
    }
}
