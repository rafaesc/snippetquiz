import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
    controllers: [HealthController],
    exports: [],
})
export class HealthModule { }
