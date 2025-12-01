import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContentEntryCreatedEvent } from './events/content-entry-created.event';
import { ContentEntryTopicAddedEvent } from './events/content-entry-topic-added.event';
import { ContentEntryDeletedEvent } from './events/content-entry-deleted.event';
import type { DomainEventEnvelope } from '../../../commons/event-bus/domain-event';
import { ContentEntryService } from './content-entry.service';

@Controller('content-entry')
export class ContentEntryController {
    private readonly logger = new Logger(ContentEntryController.name);

    constructor(private readonly contentEntryService: ContentEntryService) { }

    @MessagePattern('content-entry.events')
    async handleContentEntryEvents(@Payload() message: DomainEventEnvelope) {
        try {
            const { data } = message;

            if (data.type === ContentEntryCreatedEvent.EVENT_NAME) {
                this.logger.log(`Received ${data.type} event for aggregate ${data.attributes.aggregate_id}`);

                const event = ContentEntryCreatedEvent.fromPrimitives(
                    data.attributes,
                    data.event_id,
                    data.occurred_on,
                );

                this.logger.log(`Processing content entry: ${event.pageTitle}`);

                await this.contentEntryService.processContentEntryCreated(event);

            } else if (data.type === ContentEntryTopicAddedEvent.EVENT_NAME) {
                this.logger.log(`Received ${data.type} event for aggregate ${data.attributes.aggregate_id}`);

                const event = ContentEntryTopicAddedEvent.fromPrimitives(
                    data.attributes,
                    data.event_id,
                    data.occurred_on,
                );

                this.logger.log(`Processing content entry topic added: ${event.aggregateId}`);

                await this.contentEntryService.processContentEntryTopicAdded(event);

            } else if (data.type === ContentEntryDeletedEvent.EVENT_NAME) {
                this.logger.log(`Received ${data.type} event for aggregate ${data.attributes.aggregate_id}`);

                const event = ContentEntryDeletedEvent.fromPrimitives(
                    data.attributes,
                    data.event_id,
                    data.occurred_on,
                );

                this.logger.log(`Processing content entry deleted: ${event.aggregateId}`);

                await this.contentEntryService.processContentEntryDeleted(event);

            } else {
                this.logger.debug(`Ignoring event type: ${data.type}`);
            }
        } catch (error) {
            this.logger.error(`Error processing content-entry event: ${error.message}`, error.stack);
        }
    }
}
