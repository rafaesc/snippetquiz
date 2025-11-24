import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizCreatedEvent } from './events/quiz-created.event';

async function run() {
    console.log('Verifying QuizController...');

    // Mock QuizService
    const mockQuizService = {
        processQuizCreated: async (event: QuizCreatedEvent) => {
            console.log(`✅ QuizService.processQuizCreated called for ${event.aggregateId}`);
            console.log(`   Bank Name: ${event.bankName}`);
        },
    };

    const controller = new QuizController(mockQuizService as any);

    // Create a mock Kafka message (DomainEventEnvelope)
    const message = {
        data: {
            event_id: 'event-id-123',
            type: 'quiz.created',
            occurred_on: new Date().toISOString(),
            attributes: {
                aggregate_id: 'quiz-id-abc',
                user_id: 'user-id-def',
                content_bank_id: 'bank-id-ghi',
                bank_name: 'Test Bank',
                status: 'READY',
                created_at: new Date().toISOString(),
                instructions: 'Test instructions',
                new_content_entries: ['entry1', 'entry2'],
                entries_skipped: 0,
            },
        },
        meta: {},
    };

    console.log('Calling handleQuizEvents...');
    await controller.handleQuizEvents(message as any);
    console.log('handleQuizEvents completed.');
}

run().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
