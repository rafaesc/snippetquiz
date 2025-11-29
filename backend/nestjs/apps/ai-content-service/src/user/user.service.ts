import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { AuthUserVerifiedEvent } from '../../../commons/event-bus/events/auth-user-verified.event';
import { UserConfigResponse } from './types';
import { CharacterService } from '../character/character.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly characterService: CharacterService,
    ) { }

    async handleAuthUserVerified(event: AuthUserVerifiedEvent): Promise<void> {
        try {
            const userId = event.aggregateId;

            const existingConfig = await this.prisma.userConfig.findUnique({
                where: { userId },
            });

            if (existingConfig) {
                return;
            }

            const defaultCharacterId = await this.characterService.getDefaultCharacterId();

            await this.prisma.userConfig.create({
                data: {
                    userId,
                    defaultCharacterId,
                    characterEnabled: true,
                },
            });
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
                const defaultCharacterId = await this.characterService.getDefaultCharacterId();

                userConfig = await this.prisma.userConfig.create({
                    data: {
                        userId,
                        defaultCharacterId,
                        characterEnabled: true,
                    },
                });
            }

            return {
                userId: userConfig.userId,
                characterEnabled: userConfig.characterEnabled,
                defaultCharacterId: userConfig.defaultCharacterId,
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
                defaultCharacterId: updatedConfig.defaultCharacterId,
                createdAt: updatedConfig.createdAt,
                updatedAt: updatedConfig.updatedAt,
            };
        } catch (error) {
            this.logger.error(`Error updating character enabled: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getUserCharacter(userId: string): Promise<number | null> {
        this.logger.log(`Getting user character for user ${userId}`);

        try {
            const userConfig = await this.prisma.userConfig.findUnique({
                where: { userId },
                select: { defaultCharacterId: true, characterEnabled: true },
            });

            if (!userConfig || !userConfig.characterEnabled) {
                return null;
            }

            return userConfig.defaultCharacterId;
        } catch (error) {
            this.logger.error(`Error getting user character: ${error.message}`, error.stack);
            return null;
        }
    }
}
