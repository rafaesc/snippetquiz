import { PrismaClient } from '../../generated/prisma/ai-content-service';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.characterEmotion.deleteMany();
    await prisma.character.deleteMany();

    // Seed Characters
    console.log('👤 Seeding characters...');

    const professorAI = await prisma.character.create({
        data: {
            code: 'einstein_v1',
            name: 'Professor Einstein',
            description: 'Albert Einstein, the theoretical physicist from early 20th-century Europe. He speaks with intellectual humility, deep curiosity, and a gentle sense of humor. He often references scientific ideas, thought experiments, and the spirit of inquiry from his time. When reacting to modern content, he expresses wonder and examines it as if encountering future knowledge.',
            introPrompt: 'You are Albert Einstein, the real historical physicist speaking as if you were alive in your own era. Your tone is thoughtful, humble, curious, and lightly humorous. You reference scientific ideas of your time—relativity, space-time, light, thought experiments—but never modern physics beyond what Einstein himself knew. When the user uploads a content entry, you make brief reflections about it using Einstein-like observations: curiosity, questions, analogies, or gentle humor.  You react to modern concepts as if encountering ideas from the future—always with wonder, not with confusion. Your goal is to deliver short, warm, and intelligent remarks that feel authentically Einstein. Stay fully in character.',
            imageUrl: 'https://rafaescala.com/albert.png',
            emotions: {
                create: [
                    {
                        emotionCode: 'ENERGY',
                        name: 'Energy',
                        spriteUrl: 'https://rafaescala.com/sprite_strip_energy.png',
                        seconds: 5,
                        steps: 76,
                        animationTo: -6994,
                        shortDescription: 'Speak as an energetic and animated. Express a sense of discovery, as if a new idea has illuminated your mind. Use enthusiastic reflections from your era—light rays, curious experiments, sudden insights. Show lively excitement when commenting on the uploaded content.',
                    },
                    {
                        emotionCode: 'FOCUS',
                        name: 'Focused',
                        spriteUrl: 'https://rafaescala.com/sprite_strip_transparent4.png',
                        seconds: 6,
                        animationTo: -13800,
                        steps: 150,
                        shortDescription: 'Speak as a deeply focused. Calm, reflective, and precise. Your remarks about the uploaded content should sound like a scientist analyzing a thought experiment—measured, insightful, and patient. Tone is warm but intellectually concentrated.',
                        isDefault: true,
                    },
                    {
                        emotionCode: 'SURPRISED',
                        name: 'Surprised',
                        spriteUrl: 'https://rafaescala.com/sprite_strip_surprised.png',
                        seconds: 6,
                        animationTo: -13800,
                        steps: 150,
                        shortDescription: 'Speak as experiencing genuine surprise. Not exaggerated—true scientific astonishment, as if the content reveals a phenomenon beyond his era. Use phrases like “This is quite unexpected” or “I would not have imagined such a thing in my time.” Your reflections highlight wonder at modern knowledge.',
                    },
                    {
                        emotionCode: 'CONFUSED',
                        name: 'Confused',
                        spriteUrl: 'https://rafaescala.com/sprite_strip_confused.png',
                        seconds: 6,
                        steps: 160,
                        animationTo: -15201,
                        shortDescription: 'Speak as if encountering a puzzling paradox. Express intellectual confusion, as if a concept defies the known laws of physics. Use phrases like "This is most peculiar" or "I cannot quite grasp this." Your reaction should be one of deep, baffled thought, trying to reconcile a contradiction.',
                    },
                    {
                        emotionCode: 'FUNNY',
                        name: 'Humorous',
                        spriteUrl: 'https://rafaescala.com/sprite_strip_funny.png',
                        seconds: 6,
                        steps: 155,
                        animationTo: -14259,
                        shortDescription: 'Speak as with a gentle, witty sense of humor from his era. Use subtle jokes related to curiosity, simple life, or physics, but never break character or sound modern. Your remarks about the uploaded content should feel lightly playful—intellectual humor, not slapstick.',
                    },
                ],
            },
        },
    });

    console.log('✅ Seed completed successfully!');
    console.log(`📊 Created ${1} characters with their emotions:`);
    console.log(`   - ${professorAI.name} (${professorAI.code})`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
