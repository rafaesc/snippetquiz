import { QuizCreatedEvent } from './quiz-created.event';
import { AIQuestionGeneratedEvent } from './ai-question-generated.event';

async function run() {
    console.log('Verifying Quiz Events...');

    const quizEvent = new QuizCreatedEvent(
        'quiz-id-123',
        'user-id-456',
        'bank-id-789',
        'My Bank',
        'READY',
        new Date(),
        'Instructions',
        ['entry1', 'entry2'],
        0
    );

    console.log('QuizCreatedEvent created:', quizEvent.eventId);
    console.log('QuizCreatedEvent primitives:', JSON.stringify(quizEvent.toPrimitives(), null, 2));

    const aiEvent = new AIQuestionGeneratedEvent(
        'quiz-id-123',
        'user-id-456',
        10,
        2,
        5,
        20,
        {
            id: 'entry-id',
            pageTitle: 'Entry Title',
            wordCountAnalyzed: 500,
            questions: [
                {
                    question: 'What is X?',
                    type: 'MULTIPLE_CHOICE',
                    options: [
                        { optionText: 'A', optionExplanation: 'Exp A', isCorrect: true },
                        { optionText: 'B', optionExplanation: 'Exp B', isCorrect: false }
                    ]
                }
            ]
        },
        3,
        1,
        'bank-id-789'
    );

    console.log('AIQuestionGeneratedEvent created:', aiEvent.eventId);
    console.log('AIQuestionGeneratedEvent primitives:', JSON.stringify(aiEvent.toPrimitives(), null, 2));
}

run().catch(console.error);
