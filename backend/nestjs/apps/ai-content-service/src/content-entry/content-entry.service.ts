import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { AiClientService } from '../ai-client/ai-client.service';
import { ContentEntryCreatedEvent } from './events/content-entry-created.event';
import { AIContentEntryTopicsGeneratedEvent } from './events/ai-content-entry-topics-generated.event';
import { ContentEntryTopicAddedEvent } from './events/content-entry-topic-added.event';
import { ContentEntryDeletedEvent } from './events/content-entry-deleted.event';
import { AIContentEntryTopicsFailedEvent } from './events/ai-content-entry-topics-failed.event';
import { EventProcessorService } from '../event-processor/event-processor.service';
import { EventBusService } from '../../../commons/event-bus/event-bus.service';
import { UserService } from '../user/user.service';
import { CharacterService } from '../character/character.service';
import { CharacterEmotionsResponse, CharacterResponse } from '../character/types';

@Injectable()
export class ContentEntryService {
    private readonly logger = new Logger(ContentEntryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiClientService: AiClientService,
        private readonly eventProcessorService: EventProcessorService,
        private readonly eventBusService: EventBusService,
        private readonly userService: UserService,
        private readonly characterService: CharacterService,
    ) { }

    async processContentEntryCreated(event: ContentEntryCreatedEvent) {
        this.logger.log(`Processing content entry created: ${event.aggregateId}`);

        // Idempotency check
        if (await this.eventProcessorService.isEventProcessed(event.eventId)) {
            this.logger.log(`Event ${event.eventId} already processed. Skipping.`);
            return;
        }

        if (event.duplicated) {
            this.logger.log(`Content entry ${event.aggregateId} is duplicated. Skipping.`);
            return;
        }
        const userId = event.userId;

        // Fetch user character if enabled
        let character: CharacterEmotionsResponse | undefined = undefined;
        const userConfig = await this.userService.getUserConfigEmotionOrder(userId);
        if (userConfig?.characterEnabled) {
            try {
                character = await this.characterService.getCharacterByCode(userConfig.defaultCharacterCode);
                this.logger.log(`Using character ${character?.name} for user ${userId}`);
            } catch (error) {
                this.logger.warn(`Failed to fetch character ${userConfig.defaultCharacterCode}: ${error.message}`);
            }
        }

        try {
            // 1. Save ContentEntry projection
            await this.prisma.contentEntry.upsert({
                where: { id: event.aggregateId },
                update: {
                    content: event.content,
                    pageTitle: event.pageTitle,
                    wordCount: event.wordCount,
                },
                create: {
                    id: event.aggregateId,
                    userId,
                    content: event.content,
                    pageTitle: event.pageTitle,
                    wordCount: event.wordCount,
                },
            });
            this.logger.log(`Saved ContentEntry projection for ${event.aggregateId}`);

            const userTopics = await this.prisma.userTopic.findMany({
                where: { userId },
                select: { topic: true },
            });
            const existingTopics = userTopics.map((ut) => ut.topic);

            this.logger.log(`Found ${existingTopics.length} existing topics for user ${userId}`);
            this.logger.log(`Generating topics for page: ${event.pageTitle}`);

            const emotion = character?.emotions?.find((emotion) => emotion.emotionCode === userConfig?.emotionOrder[userConfig?.emotionIndex]);
            const result = await this.aiClientService.generateTopics(
                event.content,
                event.pageTitle,
                existingTopics,
                character?.name,
                character?.introPrompt,
                emotion?.shortDescription,
            );
            await this.userService.refreshUserConfigEmotionOrder(userConfig);


            this.logger.log(`Generated ${result.topics.length} topics for ${event.aggregateId}`);

            let characterMessage: string | null = null;
            let characterSpriteURL: string | null = null;
            let characterAnimateTo: number | null = null;
            let characterAnimateSeconds: number | null = null;
            let characterSteps: number | null = null;

            if (character && result.characterMessage && result.emotionCode) {
                this.logger.log(`Character message: ${result.characterMessage} (${emotion?.emotionCode})`);
                if (emotion) {
                    characterMessage = result.characterMessage;
                    characterSpriteURL = emotion.spriteUrl;
                    characterAnimateTo = emotion.animationTo;
                    characterAnimateSeconds = emotion.seconds;
                    characterSteps = emotion.steps;
                }
            }

            // Save new topics to UserTopic table
            if (result.topics.length > 0) {
                // 3. Publish event  
                const topicsEvent = new AIContentEntryTopicsGeneratedEvent(
                    event.aggregateId,
                    userId,
                    event.contentBankId,
                    result.topics,
                    characterMessage,
                    characterSpriteURL,
                    characterSteps,
                    characterAnimateTo,
                    characterAnimateSeconds
                );

                await this.eventBusService.publish(topicsEvent);
                this.logger.log(`Published ${AIContentEntryTopicsGeneratedEvent.EVENT_NAME} event`);
            }

            // Mark event as processed
            await this.eventProcessorService.saveEventProcessed(event);

        } catch (error) {
            this.logger.error(`Error processing content entry: ${error.message}`, error.stack);

            if (character) {
                const defaultEmotion = character.emotions?.find(e => e.isDefault);
                if (defaultEmotion) {
                    const failedEvent = new AIContentEntryTopicsFailedEvent(
                        event.aggregateId,
                        event.userId,
                        "I'm having trouble reading this content. Please try another link or try again later.",
                        defaultEmotion.spriteUrl,
                        defaultEmotion.steps,
                        defaultEmotion.animationTo,
                        defaultEmotion.seconds
                    );
                    await this.eventBusService.publish(failedEvent);
                    this.logger.log(`Published ${AIContentEntryTopicsFailedEvent.EVENT_NAME} event due to error`);
                }
            }

            throw error;
        }
    }

    async processContentEntryTopicAdded(event: ContentEntryTopicAddedEvent) {
        this.logger.log(`Processing content entry topic added: ${event.aggregateId}`);

        // Idempotency check
        if (await this.eventProcessorService.isEventProcessed(event.eventId)) {
            this.logger.log(`Event ${event.eventId} already processed. Skipping.`);
            return;
        }

        try {
            const userId = event.userId;
            const topics = event.topics;

            if (topics && topics.length > 0) {
                await this.prisma.userTopic.createMany({
                    data: topics.map((topic) => ({
                        userId,
                        topic,
                    })),
                    skipDuplicates: true,
                });
                this.logger.log(`Saved new topics to UserTopic table for user ${userId}`);
            }

            // Mark event as processed
            await this.eventProcessorService.saveEventProcessed(event);

        } catch (error) {
            this.logger.error(`Error processing content entry topic added: ${error.message}`, error.stack);
            throw error;
        }
    }

    async processContentEntryDeleted(event: ContentEntryDeletedEvent) {
        this.logger.log(`Processing content entry deleted: ${event.aggregateId}`);

        // Idempotency check
        if (await this.eventProcessorService.isEventProcessed(event.eventId)) {
            this.logger.log(`Event ${event.eventId} already processed. Skipping.`);
            return;
        }

        try {
            await this.prisma.contentEntry.delete({
                where: { id: event.aggregateId },
            });
            this.logger.log(`Deleted ContentEntry projection for ${event.aggregateId}`);

            // Mark event as processed
            await this.eventProcessorService.saveEventProcessed(event);

        } catch (error) {
            if (error.code === 'P2025') {
                this.logger.warn(`ContentEntry ${event.aggregateId} not found to delete.`);
                // Still mark as processed as the desired state is achieved
                await this.eventProcessorService.saveEventProcessed(event);
            } else {
                this.logger.error(`Error processing content entry deleted: ${error.message}`, error.stack);
                throw error;
            }
        }
    }
}
