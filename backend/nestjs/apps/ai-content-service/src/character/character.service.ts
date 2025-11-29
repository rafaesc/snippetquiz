import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { CharacterEmotionsResponse, CharacterResponse } from './types';

@Injectable()
export class CharacterService {
    private readonly logger = new Logger(CharacterService.name);
    private readonly DEFAULT_CHARACTER_CODE = 'einstein_v1';
    private defaultCharacterId: number | null = null;

    constructor(private readonly prisma: PrismaService) { }

    async getDefaultCharacterId(): Promise<number> {
        if (this.defaultCharacterId !== null) {
            return this.defaultCharacterId;
        }

        const character = await this.prisma.character.findUnique({
            where: { code: this.DEFAULT_CHARACTER_CODE },
            select: { id: true },
        });

        if (!character) {
            throw new Error(`Default character with code '${this.DEFAULT_CHARACTER_CODE}' not found`);
        }

        this.defaultCharacterId = character.id;
        return this.defaultCharacterId;
    }

    async getAllCharacters(): Promise<CharacterResponse[]> {
        try {
            const characters = await this.prisma.character.findMany({
                include: {
                    emotions: true,
                },
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

    async getCharacterById(characterId: number): Promise<CharacterEmotionsResponse> {
        this.logger.log(`Getting character ${characterId} with emotions`);

        try {
            const character = await this.prisma.character.findUnique({
                where: { id: characterId },
                include: {
                    emotions: true,
                },
            });

            if (!character) {
                throw new NotFoundException(`Character with ID ${characterId} not found`);
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
                    isDefault: emotion.isDefault,
                })),
            };
        } catch (error) {
            this.logger.error(`Error getting character: ${error.message}`, error.stack);
            throw error;
        }
    }
}
