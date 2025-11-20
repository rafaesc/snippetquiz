import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoreController } from './core.controller';
import { CoreServiceProxyService } from './core-service-proxy.service';


@Module({
  imports: [
    HttpModule,
  ],
  controllers: [
    CoreController
  ],
  providers: [
    CoreServiceProxyService,
  ],
  exports: [CoreServiceProxyService],
})
export class CoreServiceModule {}
