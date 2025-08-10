import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { RedisService } from './redis.service';
import { redisEnvs } from '../config/redis-envs';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const connectionString = `redis://${redisEnvs.user}:${redisEnvs.password}@${redisEnvs.host}:${redisEnvs.port}`;
        
        return {
          store: [
            createKeyv(connectionString),
          ],
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService, CacheModule],
})
export class RedisModule { }