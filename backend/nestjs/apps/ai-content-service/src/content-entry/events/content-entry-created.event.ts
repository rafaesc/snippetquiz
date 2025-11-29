import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export class ContentEntryCreatedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'content_entry.created';

    readonly contentBankId: string;
    readonly contentType: string;
    readonly content: string;
    readonly sourceUrl: string;
    readonly pageTitle: string;
    readonly createdAt: Date;
    readonly wordCount: number;
    readonly videoDuration: number;
    readonly youtubeVideoId: string;
    readonly youtubeChannelId: number;
    readonly duplicated: boolean;

    constructor(
        aggregateId: string,
        userId: string,
        contentBankId: string,
        contentType: string,
        content: string,
        sourceUrl: string,
        pageTitle: string,
        createdAt: Date,
        wordCount: number,
        videoDuration: number,
        youtubeVideoId: string,
        youtubeChannelId: number,
        duplicated: boolean,
        eventId: string,
        occurredOn?: string,
    ) {
        super(
            ContentEntryCreatedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
        this.contentBankId = contentBankId;
        this.contentType = contentType;
        this.content = content;
        this.sourceUrl = sourceUrl;
        this.pageTitle = pageTitle;
        this.createdAt = createdAt;
        this.wordCount = wordCount;
        this.videoDuration = videoDuration;
        this.youtubeVideoId = youtubeVideoId;
        this.youtubeChannelId = youtubeChannelId;
        this.duplicated = duplicated;
    }

    toPrimitives(): DomainEventAttributes {
        throw new Error('Not implemented');
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): ContentEntryCreatedEvent {
        return new ContentEntryCreatedEvent(
            body.aggregate_id,
            body.user_id,
            body.content_bank_id,
            body.content_type,
            body.content,
            body.source_url,
            body.page_title,
            new Date(body.created_at),
            body.word_count,
            body.video_duration,
            body.youtube_video_id,
            body.youtube_channel_id,
            body.duplicated,
            eventId,
            occurredOn,
        );
    }
}
