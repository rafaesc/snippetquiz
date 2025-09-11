import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { RedisModule } from '../../../commons/services/redis.module';

@Module({
  imports: [
    RedisModule,
  ],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
