import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { AiClientService } from '../ai-client/ai-client.service';
import { ContentEntryCreatedEvent } from './events/content-entry-created.event';
import { AIContentEntryTopicsGeneratedEvent } from './events/ai-content-entry-topics-generated.event';
import { ContentEntryTopicAddedEvent } from './events/content-entry-topic-added.event';
import { EventProcessorService } from '../event-processor/event-processor.service';
import { EventBusService } from '../../../commons/event-bus/event-bus.service';
import { UserService } from '../user/user.service';
import { CharacterService } from '../character/character.service';
import { CharacterResponse } from '../character/types';

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

        try {
            const userId = event.userId;
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

            // Fetch user character if enabled
            let character: CharacterResponse | undefined = undefined;
            const characterId = await this.userService.getUserCharacter(userId);
            if (characterId) {
                try {
                    character = await this.characterService.getCharacterById(characterId);
                    this.logger.log(`Using character ${character.name} for user ${userId}`);
                } catch (error) {
                    this.logger.warn(`Failed to fetch character ${characterId}: ${error.message}`);
                }
            }

            const result = await this.aiClientService.generateTopics(
                event.content,
                event.pageTitle,
                existingTopics,
                character,
            );

            this.logger.log(`Generated ${result.topics.length} topics for ${event.aggregateId}`);
            if (result.characterMessage) {
                this.logger.log(`Character message: ${result.characterMessage} (${result.emotionCode})`);
            }

            // Save new topics to UserTopic table
            if (result.topics.length > 0) {
                // 3. Publish event  
                const topicsEvent = new AIContentEntryTopicsGeneratedEvent(
                    event.aggregateId,
                    userId,
                    event.contentBankId,
                    result.topics,
                );

                await this.eventBusService.publish(topicsEvent);
                this.logger.log(`Published ${AIContentEntryTopicsGeneratedEvent.EVENT_NAME} event`);
            }

            // Mark event as processed
            await this.eventProcessorService.saveEventProcessed(event);

        } catch (error) {
            this.logger.error(`Error processing content entry: ${error.message}`, error.stack);
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
}
