import { DomainEvent, DomainEventAttributes } from '../../../../commons/event-bus/domain-event';

export interface QuestionOptionDto {
    optionText: string;
    optionExplanation: string;
    isCorrect: boolean;
}

export interface QuestionDto {
    question: string;
    type: string;
    options: QuestionOptionDto[];
}

export interface ContentEntryDto {
    id: string;
    pageTitle: string | null;
    wordCountAnalyzed: number | null;
    questions: QuestionDto[];
}

export class AIQuestionGeneratedEvent extends DomainEvent {
    static readonly EVENT_NAME = 'ai-processor.questions.generated';

    readonly totalContentEntries: number;
    readonly totalContentEntriesSkipped: number;
    readonly currentContentEntryIndex: number;
    readonly questionsGeneratedSoFar: number;
    readonly contentEntry: ContentEntryDto;
    readonly totalChunks: number;
    readonly currentChunkIndex: number;
    readonly bankId: string;

    constructor(
        aggregateId: string,
        userId: string,
        totalContentEntries: number,
        totalContentEntriesSkipped: number,
        currentContentEntryIndex: number,
        questionsGeneratedSoFar: number,
        contentEntry: ContentEntryDto,
        totalChunks: number,
        currentChunkIndex: number,
        bankId: string,
        eventId?: string,
        occurredOn?: string,
    ) {
        super(
            AIQuestionGeneratedEvent.EVENT_NAME,
            aggregateId,
            userId,
            eventId,
            occurredOn,
        );
        this.totalContentEntries = totalContentEntries;
        this.totalContentEntriesSkipped = totalContentEntriesSkipped;
        this.currentContentEntryIndex = currentContentEntryIndex;
        this.questionsGeneratedSoFar = questionsGeneratedSoFar;
        this.contentEntry = contentEntry;
        this.totalChunks = totalChunks;
        this.currentChunkIndex = currentChunkIndex;
        this.bankId = bankId;
    }

    toPrimitives(): DomainEventAttributes {
        return {
            total_content_entries: this.totalContentEntries,
            total_content_entries_skipped: this.totalContentEntriesSkipped,
            current_content_entry_index: this.currentContentEntryIndex,
            questions_generated_so_far: this.questionsGeneratedSoFar,
            content_entry: this.contentEntry,
            total_chunks: this.totalChunks,
            current_chunk_index: this.currentChunkIndex,
            bank_id: this.bankId,
            aggregate_id: this.aggregateId,
            user_id: this.userId,
        };
    }

    static fromPrimitives(
        body: DomainEventAttributes,
        eventId: string,
        occurredOn: string,
    ): AIQuestionGeneratedEvent {
        return new AIQuestionGeneratedEvent(
            body.aggregate_id,
            body.user_id,
            body.total_content_entries,
            body.total_content_entries_skipped,
            body.current_content_entry_index,
            body.questions_generated_so_far,
            body.content_entry as ContentEntryDto,
            body.total_chunks,
            body.current_chunk_index,
            body.bank_id,
            eventId,
            occurredOn,
        );
    }
}
