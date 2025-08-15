import { Controller, Get } from '@nestjs/common';
import { LogsServiceService } from './logs-service.service';

@Controller()
export class LogsServiceController {
  constructor(private readonly logsServiceService: LogsServiceService) {}

  @Get()
  getHello(): string {
    return this.logsServiceService.getHello();
  }
}
