import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class AIContentEntryTopicsFailedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'ai_content_entry.topics_failed';

    readonly characterMessage: string | null;
    readonly characterSpriteURL: string | null;
    readonly characterSteps: number | null;
    readonly characterAnimateTo: number | null;
    readonly characterAnimateSeconds: number | null;

    constructor(
        aggregateId: string,
        userId: string,
        characterMessage: string | null,
        characterSpriteURL: string | null,
        characterSteps: number | null,
        characterAnimateTo: number | null,
        characterAnimateSeconds: number | null,
        eventId?: string,
        occurredOn?: string,
    ) {
        super(
            AIContentEntryTopicsFailedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
        this.characterMessage = characterMessage;
        this.characterSpriteURL = characterSpriteURL;
        this.characterSteps = characterSteps;
        this.characterAnimateTo = characterAnimateTo;
        this.characterAnimateSeconds = characterAnimateSeconds;
    }

    toPrimitives(): DomainEventAttributes {
        return {
            aggregate_id: this.aggregateId,
            user_id: this.userId,
            character_message: this.characterMessage,
            character_sprite_url: this.characterSpriteURL,
            character_steps: this.characterSteps,
            character_animate_to: this.characterAnimateTo,
            character_animate_seconds: this.characterAnimateSeconds,
        };
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): AIContentEntryTopicsFailedEvent {
        return new AIContentEntryTopicsFailedEvent(
            body.aggregate_id,
            body.user_id,
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
