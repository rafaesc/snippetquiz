import { Test, TestingModule } from '@nestjs/testing';
import { CoreServiceController } from './core-service.controller';
import { CoreServiceService } from './core-service.service';

describe('CoreServiceController', () => {
  let coreServiceController: CoreServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreServiceController],
      providers: [CoreServiceService],
    }).compile();

    coreServiceController = app.get<CoreServiceController>(
      CoreServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(coreServiceController.getHello()).toBe('Hello World!');
    });
  });
});
