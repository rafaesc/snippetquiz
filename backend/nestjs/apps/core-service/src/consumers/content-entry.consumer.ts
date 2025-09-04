import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../../../commons/services';
import { type ContentEntryEventPayload } from '../content-entry/dto/content-entry-event.dto';

@Controller()
export class ContentEntryConsumer {
  private readonly logger = new Logger(ContentEntryConsumer.name);

  constructor(private prisma: PrismaService) {}

  @EventPattern('content-entry-events')
  async handleContentEntryEvent(@Payload() data: ContentEntryEventPayload) {
    try {
      if (data.action === 'SAVE') {
        await this.handleSaveEvent(data);
      }
    } catch (error) {
      this.logger.error('Failed to process content-entry event', error);
    }
  }

  private async handleSaveEvent(data: ContentEntryEventPayload) {
    this.logger.log(`Processing SAVE event for content ID: ${data.contentId} - ${data.topics?.length}`);

    try {
      // Parse the generated topics from the content field (JSON string)
      const generatedTopics = data.topics || [];
      let topicsCreated = 0;

      // Get the content entry to link topics to
      const contentEntry = await this.prisma.contentEntry.findUnique({
        where: { id: BigInt(data.contentId) },
      });

      if (!contentEntry) {
        this.logger.error(`Content entry not found: ${data.contentId}`);
        return;
      }

      // Process each generated topic
      for (const topicName of generatedTopics) {
        try {
          const topic = await this.prisma.topic.upsert({
            where: {
              userId_topic: {
                userId: data.userId,
                topic: topicName,
              },
            },
            update: {},
            create: {
              userId: data.userId,
              topic: topicName,
            },
          });

          await this.prisma.contentEntryTopic.upsert({
            where: {
              contentEntryId_topicId: {
                contentEntryId: contentEntry.id,
                topicId: topic.id,
              },
            },
            update: {},
            create: {
              contentEntryId: contentEntry.id,
              topicId: topic.id,
            },
          });

          topicsCreated++;
        } catch (error) {
          this.logger.error(`Error creating topic "${topicName}":`, error);
        }
      }

      this.logger.log(
        `Successfully created and linked ${topicsCreated} topics to content entry ${data.contentId}`,
      );
    } catch (error) {
      this.logger.error('Error processing SAVE event:', error);
    }
  }
}