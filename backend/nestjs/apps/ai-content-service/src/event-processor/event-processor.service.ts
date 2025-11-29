import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { DomainEvent } from '../../../commons/event-bus/domain-event';

@Injectable()
export class EventProcessorService {
    private readonly logger = new Logger(EventProcessorService.name);

    constructor(private readonly prisma: PrismaService) { }

    async saveEventProcessed(event: DomainEvent): Promise<void> {
        try {
            await this.prisma.eventProcessed.create({
                data: {
                    id: event.eventId,
                    userId: event.userId || event.aggregateId, // Fallback logic
                    eventType: event.eventName,
                },
            });
            this.logger.log(`Event processed saved: ${event.eventId}`);
        } catch (error) {
            this.logger.error(`Error saving processed event ${event.eventId}: ${error.message}`, error.stack);
        }
    }

    async isEventProcessed(eventId: string): Promise<boolean> {
        const count = await this.prisma.eventProcessed.count({
            where: { id: eventId },
        });
        return count > 0;
    }
}
