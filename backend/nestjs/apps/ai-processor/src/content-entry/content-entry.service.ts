import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { AiClientService } from '../ai-client/ai-client.service';
import { ContentEntryCreatedEvent } from './events/content-entry-created.event';
import { ContentEntryTopicsGeneratedEvent } from './events/content-entry-topics-generated.event';
import { EventProcessorService } from '../event-processor/event-processor.service';
import { EventBusService } from '../../../commons/event-bus/event-bus.service';

@Injectable()
export class ContentEntryService {
    private readonly logger = new Logger(ContentEntryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly aiClientService: AiClientService,
        private readonly eventProcessorService: EventProcessorService,
        private readonly eventBusService: EventBusService,
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

            // 2. Generate topics

            // Fetch existing topics for the user from DB
            const userTopics = await this.prisma.userTopic.findMany({
                where: { userId },
                select: { topic: true },
            });
            const existingTopics = userTopics.map((ut) => ut.topic);

            this.logger.log(`Found ${existingTopics.length} existing topics for user ${userId}`);
            this.logger.log(`Generating topics for page: ${event.pageTitle}`);

            const generatedTopics = await this.aiClientService.generateTopics(
                event.content,
                event.pageTitle,
                existingTopics,
            );

            this.logger.log(`Generated ${generatedTopics.length} topics for ${event.aggregateId}`);

            // Save new topics to UserTopic table
            if (generatedTopics.length > 0) {
                // We use createMany with skipDuplicates if supported, or loop upsert/create
                // Assuming Postgres and Prisma support skipDuplicates
                await this.prisma.userTopic.createMany({
                    data: generatedTopics.map((topic) => ({
                        userId,
                        topic,
                    })),
                    skipDuplicates: true,
                });
                this.logger.log(`Saved new topics to UserTopic table`);

                // 3. Publish event  
                const topicsEvent = new ContentEntryTopicsGeneratedEvent(
                    event.aggregateId,
                    userId,
                    event.contentBankId,
                    generatedTopics,
                );

                await this.eventBusService.publish(topicsEvent);
                this.logger.log(`Published ${ContentEntryTopicsGeneratedEvent.EVENT_NAME} event`);
            }

            // Mark event as processed
            await this.eventProcessorService.saveEventProcessed(event);

        } catch (error) {
            this.logger.error(`Error processing content entry: ${error.message}`, error.stack);
            throw error;
        }
    }
}
