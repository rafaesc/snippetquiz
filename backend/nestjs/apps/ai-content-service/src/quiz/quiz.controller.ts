import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuizService } from './quiz.service';
import { QuizCreatedEvent } from './events/quiz-created.event';
import type { DomainEventEnvelope } from '../../../commons/event-bus/domain-event';

@Controller('quiz')
export class QuizController {
    private readonly logger = new Logger(QuizController.name);

    constructor(private readonly quizService: QuizService) { }

    @MessagePattern('quiz.aggregate')
    async handleQuizEvents(@Payload() message: DomainEventEnvelope) {
        try {
            const { data } = message;

            if (data.type === QuizCreatedEvent.EVENT_NAME) {
                this.logger.log(`Received ${data.type} event for aggregate ${data.attributes.aggregate_id}`);

                const event = QuizCreatedEvent.fromPrimitives(
                    data.attributes,
                    data.event_id,
                    data.occurred_on,
                );

                this.logger.log(`Processing quiz created: ${event.aggregateId}`);

                await this.quizService.processQuizCreated(event);

            } else {
                this.logger.debug(`Ignoring event type: ${data.type}`);
            }
        } catch (error) {
            this.logger.error(`Error processing quiz event: ${error.message}`, error.stack);
        }
    }
}
