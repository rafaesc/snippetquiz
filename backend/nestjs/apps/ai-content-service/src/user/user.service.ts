import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { AuthUserVerifiedEvent } from '../../../commons/event-bus/events/auth-user-verified.event';
import { UserConfigEmotionOrderRequest, UserConfigResponse } from './types';
import { CharacterService } from '../character/character.service';
import { UserConfig } from 'generated/prisma/ai-content-service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly characterService: CharacterService,
    ) { }

    async createDefaultUserConfig(userId: string): Promise<UserConfig> {
        const defaultCharacterCode = this.characterService.getDefaultCharacterCode();
        const emotionOrder = await this.getEmotionOrder(defaultCharacterCode);

        return this.prisma.userConfig.create({
            data: {
                userId,
                defaultCharacterCode,
                characterEnabled: true,
                emotionOrder: emotionOrder || [],
                emotionIndex: 0,
            },
        });
    }

    async handleAuthUserVerified(event: AuthUserVerifiedEvent): Promise<void> {
        try {
            const userId = event.aggregateId;

            const existingConfig = await this.prisma.userConfig.findUnique({
                where: { userId },
            });

            if (existingConfig) {
                return;
            }

            await this.createDefaultUserConfig(userId);
        } catch (error) {
            this.logger.error(`Error processing auth user verified: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getUserConfig(userId: string): Promise<UserConfigResponse> {
        try {
            let userConfig = await this.prisma.userConfig.findUnique({
                where: { userId },
            });

            if (!userConfig) {
                userConfig = await this.createDefaultUserConfig(userId);
            }

            return {
                userId: userConfig.userId,
                characterEnabled: userConfig.characterEnabled,
                defaultCharacterCode: userConfig.defaultCharacterCode,
                createdAt: userConfig.createdAt,
                updatedAt: userConfig.updatedAt,
            };
        } catch (error) {
            this.logger.error(`Error getting user config: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updateCharacterEnabled(userId: string, enabled: boolean): Promise<UserConfigResponse> {
        try {
            await this.getUserConfig(userId);

            const updatedConfig = await this.prisma.userConfig.update({
                where: { userId },
                data: { characterEnabled: enabled },
            });

            return {
                userId: updatedConfig.userId,
                characterEnabled: updatedConfig.characterEnabled,
                defaultCharacterCode: updatedConfig.defaultCharacterCode,
                createdAt: updatedConfig.createdAt,
                updatedAt: updatedConfig.updatedAt,
            };
        } catch (error) {
            this.logger.error(`Error updating character enabled: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getUserConfigEmotionOrder(userId: string): Promise<UserConfigEmotionOrderRequest | null> {
        this.logger.log(`Getting user character for user ${userId}`);

        try {
            const userConfig = await this.prisma.userConfig.findUnique({
                where: { userId },
                select: { userId: true, defaultCharacterCode: true, characterEnabled: true, emotionOrder: true, emotionIndex: true, },
            });

            if (!userConfig || !userConfig.characterEnabled) {
                return null;
            }

            return {
                userId: userConfig.userId,
                emotionOrder: userConfig.emotionOrder,
                defaultCharacterCode: userConfig.defaultCharacterCode,
                characterEnabled: userConfig.characterEnabled,
                emotionIndex: userConfig.emotionIndex,
            };
        } catch (error) {
            this.logger.error(`Error getting user character: ${error.message}`, error.stack);
            return null;
        }
    }

    async getEmotionOrder(characterCode: string): Promise<string[] | null> {
        try {
            const character = await this.characterService.getCharacterByCode(characterCode);
            if (!character) {
                return null;
            }
            const emotionOrder: string[] = [];

            character?.emotions?.forEach(emotion => {
                for (let i = 0; i < (emotion?.weighted || 0); i++) {
                    emotionOrder.push(emotion.emotionCode);
                }
            });

            // Fisher-Yates shuffle to randomize emotion order
            for (let i = emotionOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [emotionOrder[i], emotionOrder[j]] = [emotionOrder[j], emotionOrder[i]];

            return emotionOrder;
        } catch (error) {
            this.logger.error(`Error getting emotion order: ${error.message}`, error.stack);
            return null;
        }
    }

    async refreshUserConfigEmotionOrder(userConfigRequest: UserConfigEmotionOrderRequest | null): Promise<void> {
        try {
            if (!userConfigRequest) {
                return;
            }
            if (userConfigRequest.emotionOrder && userConfigRequest.emotionOrder[userConfigRequest.emotionIndex + 1]) {
                await this.prisma.userConfig.update({
                    where: { userId: userConfigRequest.userId },
                    data: {
                        emotionIndex: userConfigRequest.emotionIndex + 1,
                    },
                });
                return;
            }

            const emotionOrder = await this.getEmotionOrder(userConfigRequest.defaultCharacterCode);

            if (!emotionOrder) {
                return;
            }

            await this.prisma.userConfig.update({
                where: { userId: userConfigRequest.userId },
                data: {
                    emotionOrder,
                    emotionIndex: 0,
                },
            });
        } catch (error) {
            this.logger.error(`Error refreshing user config emotion order: ${error.message}`, error.stack);
        }
    }
}
