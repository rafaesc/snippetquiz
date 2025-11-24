import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DomainEvent, DomainEventEnvelope } from './domain-event';
import { KAFKA_SERVICE } from './constants';

@Injectable()
export class EventBusService {
    private readonly logger = new Logger(EventBusService.name);

    constructor(@Inject(KAFKA_SERVICE) private readonly client: ClientKafka) { }

    async publish(event: DomainEvent): Promise<void> {
        const payload: DomainEventEnvelope = {
            data: {
                event_id: event.eventId,
                type: event.eventName,
                occurred_on: event.occurredOn,
                attributes: event.toPrimitives(),
            },
            meta: event.meta,
        };

        this.client.emit(event.eventName, payload);
        this.logger.log(`Published ${event.eventName} event ${event.eventId} of aggregate ${event.aggregateId}`);
    }
}
