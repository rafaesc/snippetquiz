import { ContentEntryService } from './content-entry.service';
import { ContentEntryCreatedEvent } from './events/content-entry-created.event';

async function run() {
    // Mock dependencies
    const mockPrismaService = {
        contentEntry: {
            upsert: async (args: any) => {
                console.log(`✅ Prisma.contentEntry.upsert called for ${args.where.id}`);
                return args.create;
            },
        },
        userTopic: {
            findMany: async (args: any) => {
                console.log(`✅ Prisma.userTopic.findMany called for user ${args.where.userId}`);
                return [{ topic: 'Existing Topic 1' }];
            },
            createMany: async (args: any) => {
                console.log(`✅ Prisma.userTopic.createMany called with ${args.data.length} topics`);
                return { count: args.data.length };
            },
        },
    };

    const mockAiClientService = {
        generateTopics: async (content: string, pageTitle: string, existingTopics: string[]) => {
            console.log(`✅ AiClientService.generateTopics called for ${pageTitle}`);
            console.log(`   Existing topics: ${existingTopics.join(', ')}`);
            return ['Topic A', 'Topic B'];
        },
    };

    const mockEventProcessorService = {
        isEventProcessed: async () => { console.log('✅ EventProcessorService.isEventProcessed called'); return false; },
        saveEventProcessed: async () => { console.log('✅ EventProcessorService.saveEventProcessed called'); },
    };

    const mockEventBusService = {
        publish: async (event: any) => {
            console.log(`✅ EventBusService.publish called with topic: ${event.eventName}`);
            if (event.eventName === 'ai-content-service.topics.added') {
                console.log('   ✅ Event name correct');
            }
        },
    };

    const mockUserService = {
        getUserCharacter: async (userId: string) => {
            console.log(`✅ UserService.getUserCharacter called for user ${userId}`);
            return 'character-id-123';
        },
    };

    const mockCharacterService = {
        getCharacterById: async (characterId: string) => {
            console.log(`✅ CharacterService.getCharacterById called for character ${characterId}`);
            return { name: 'Character A' };
        },
    };

    // Instantiate service directly
    const service = new ContentEntryService(
        mockPrismaService as any,
        mockAiClientService as any,
        mockEventProcessorService as any,
        mockEventBusService as any,
        mockUserService as any,
        mockCharacterService as any,
    );

    console.log('ContentEntryService initialized.');

    // Create a mock event
    const event = new ContentEntryCreatedEvent(
        'aggregate-id-123', // aggregateId
        'user-id-456',      // userId
        'content-bank-id-789', // contentBankId
        'article',          // contentType
        'Some content',     // content
        'http://url.com',   // sourceUrl
        'Page Title',       // pageTitle
        new Date(),         // createdAt
        100,                // wordCount
        0,                  // videoDuration
        '',                 // youtubeVideoId
        0,                  // youtubeChannelId
        false,              // duplicated
        'event-id-abc',     // eventId
        new Date().toISOString(), // occurredOn
    );

    // Run the method
    console.log('Calling processContentEntryCreated...');
    await service.processContentEntryCreated(event);
    console.log('processContentEntryCreated completed.');
}

run().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
