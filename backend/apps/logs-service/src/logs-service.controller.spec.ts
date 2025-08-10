import { Test, TestingModule } from '@nestjs/testing';
import { LogsServiceController } from './logs-service.controller';
import { LogsServiceService } from './logs-service.service';

describe('LogsServiceController', () => {
  let logsServiceController: LogsServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LogsServiceController],
      providers: [LogsServiceService],
    }).compile();

    logsServiceController = app.get<LogsServiceController>(
      LogsServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(logsServiceController.getHello()).toBe('Hello World!');
    });
  });
});
