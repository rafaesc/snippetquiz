import { Controller, Get, Put, Body, Logger, Req } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthUserVerifiedEvent } from '../../../commons/event-bus/events/auth-user-verified.event';
import type { DomainEventEnvelope } from '../../../commons/event-bus/domain-event';
import { UserService } from './user.service';
import type { UserConfigResponse, UpdateCharacterEnabledRequest } from './types';
import { X_USER_ID_HEADER } from '../../../commons/config/constants';

@Controller('user-config')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) { }

    @MessagePattern('auth.user.verified')
    async handleAuthUserVerified(@Payload() message: DomainEventEnvelope) {
        try {
            const { data } = message;

            if (data.type === AuthUserVerifiedEvent.EVENT_NAME) {
                this.logger.log(`Received ${data.type} event for user ${data.attributes.aggregate_id}`);

                const event = AuthUserVerifiedEvent.fromPrimitives(
                    data.attributes,
                    data.event_id,
                    data.occurred_on,
                );

                await this.userService.handleAuthUserVerified(event);
            } else {
                this.logger.debug(`Ignoring event type: ${data.type}`);
            }
        } catch (error) {
            this.logger.error(`Error processing auth user verified event: ${error.message}`, error.stack);
        }
    }

    @Get()
    async getUserConfig(@Req() req: any): Promise<UserConfigResponse> {
        const userId = req.headers[X_USER_ID_HEADER];
        this.logger.log(`GET /user-config for user ${userId}`);
        return await this.userService.getUserConfig(userId);
    }

    @Put('character-enabled')
    async updateCharacterEnabled(
        @Req() req: any,
        @Body() body: UpdateCharacterEnabledRequest,
    ): Promise<UserConfigResponse> {
        const userId = req.headers[X_USER_ID_HEADER];
        this.logger.log(`PUT /user-config/character-enabled for user ${userId}`);
        return await this.userService.updateCharacterEnabled(userId, body.characterEnabled);
    }
}
