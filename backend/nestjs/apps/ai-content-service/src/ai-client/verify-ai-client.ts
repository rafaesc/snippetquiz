import { Test, TestingModule } from '@nestjs/testing';
import { AiClientService } from './ai-client.service';
import { envs } from '../config/envs';

async function verify() {
    console.log('Starting verification...');

    // Mock envs if needed, or rely on actual envs if .env is loaded
    // Assuming .env is loaded via dotenv/config in envs.ts

    if (!envs.openRouterApiKey) {
        console.error('Error: OPENROUTER_API_KEY is not set.');
        return;
    }

    const module: TestingModule = await Test.createTestingModule({
        providers: [AiClientService],
    }).compile();

    const service = module.get<AiClientService>(AiClientService);
    service.onModuleInit();

    console.log('AiClientService initialized.');

    // Test generateTopics
    console.log('\nTesting generateTopics...');
    const topics = await service.generateTopics(
        'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications.',
        'NestJS Overview',
        ['Node.js', 'JavaScript']
    );
    console.log('Generated Topics:', topics);

    // Test generateQuizQuestions
    console.log('\nTesting generateQuizQuestions...');
    const quiz = await service.generateQuizQuestions(
        'Create questions for beginners.',
        ['Summary of previous chapter'],
        'NestJS Overview',
        'NestJS is built with and fully supports TypeScript. It combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).'
    );
    console.log('Generated Quiz:', JSON.stringify(quiz, null, 2));
}

verify().catch(console.error);
