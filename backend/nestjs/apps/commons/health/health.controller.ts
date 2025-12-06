import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return {
            status: 'UP',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
