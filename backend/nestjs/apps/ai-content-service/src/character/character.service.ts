import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { CharacterEmotionsResponse, CharacterResponse } from './types';

@Injectable()
export class CharacterService {
    private readonly logger = new Logger(CharacterService.name);
    private static readonly DEFAULT_CHARACTER_CODE = 'einstein_v1';

    constructor(private readonly prisma: PrismaService) { }

    getDefaultCharacterCode(): string {
        return CharacterService.DEFAULT_CHARACTER_CODE;
    }

    async getAllCharacters(): Promise<CharacterResponse[]> {
        try {
            const characters = await this.prisma.character.findMany({
                orderBy: {
                    id: 'asc',
                },
            });

            return characters.map(character => ({
                id: character.id,
                code: character.code,
                name: character.name,
                description: character.description,
                introPrompt: character.introPrompt,
            }));
        } catch (error) {
            this.logger.error(`Error getting all characters: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getCharacterByCode(characterCode: string): Promise<CharacterEmotionsResponse> {
        this.logger.log(`Getting character ${characterCode} with emotions`);

        try {
            const character = await this.prisma.character.findUnique({
                where: { code: characterCode },
                include: {
                    emotions: true,
                },
            });

            if (!character) {
                throw new NotFoundException(`Character with code ${characterCode} not found`);
            }

            return {
                id: character.id,
                code: character.code,
                name: character.name,
                description: character.description,
                introPrompt: character.introPrompt,
                emotions: character.emotions.map(emotion => ({
                    id: emotion.id,
                    emotionCode: emotion.emotionCode,
                    name: emotion.name,
                    shortDescription: emotion.shortDescription,
                    spriteUrl: emotion.spriteUrl,
                    seconds: emotion.seconds,
                    animationTo: emotion.animationTo,
                    steps: emotion.steps,
                    weighted: emotion.weighted,
                    isDefault: emotion.isDefault,
                })),
            };
        } catch (error) {
            this.logger.error(`Error getting character: ${error.message}`, error.stack);
            throw error;
        }
    }
}
