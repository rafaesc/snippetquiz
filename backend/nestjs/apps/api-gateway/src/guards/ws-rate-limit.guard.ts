import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Socket } from 'socket.io';
import { RedisService } from '../../../commons/services/redis.service';

interface RateLimitConfig {
  maxRequests: number; // Maximum requests per window
  windowTime: string; // Time window in seconds
  keyPrefix?: string; // Optional key prefix
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

@Injectable()
export class WsRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(WsRateLimitGuard.name);
  private readonly defaultConfig: RateLimitConfig = {
    maxRequests: 100,
    windowTime: '1d',
    keyPrefix: 'ws_rate_limit',
  };

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const config = this.getConfig(context);
      
      const key = this.generateKey(client, config);
      
      const result = await this.redisService.checkRateLimit(
        key,
        config.maxRequests,
        config.windowTime,
      );
      
      if (result.exceeded) {
        this.logger.warn(
          `Rate limit exceeded for ${key}. Current: ${result.count}, Max: ${config.maxRequests}`,
        );
        
        // Emit rate limit error to client
        client.emit('rateLimitError', {
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil(this.redisService.parseExpirationTime(config.windowTime)),
          limit: config.maxRequests,
          current: result.count,
          resetTime: result.resetTime,
        });

        client.disconnect();
      }
      
      this.logger.debug(
        `Rate limit check passed for ${key}. Current: ${result.count}/${config.maxRequests}`,
      );
      
      return true;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw error;
      }
      
      this.logger.error('Error in rate limit guard:', error);
      // Fail open - allow request if there's an unexpected error
      return true;
    }
  }

  /**
   * Get rate limit configuration from metadata or use default
   */
  private getConfig(context: ExecutionContext): RateLimitConfig {
    const metadata = Reflect.getMetadata('rateLimit', context.getHandler());
    return { ...this.defaultConfig, ...metadata };
  }

  /**
   * Generate a unique key for rate limiting
   */
  private generateKey(client: Socket, config: RateLimitConfig): string {
    const userId = (client as any).data?.userId || (client as any).data?.user?.id;
    const ip = client.handshake.address;
    const socketId = client.id;
    
    // Prefer user ID, fallback to IP, then socket ID
    const identifier = userId || ip || socketId;
    
    return `${config.keyPrefix}:${identifier}`;
  }

  /**
   * Reset rate limit for a specific client (useful for testing or admin operations)
   */
  async resetRateLimit(client: Socket, config?: Partial<RateLimitConfig>): Promise<void> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const key = this.generateKey(client, fullConfig);
    await this.redisService.resetRateLimit(key);
  }

  /**
   * Get current rate limit status for a client
   */
  async getRateLimitStatus(
    client: Socket,
    config?: Partial<RateLimitConfig>,
  ): Promise<{ count: number; limit: number; remaining: number }> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const key = this.generateKey(client, fullConfig);
    const count = await this.redisService.getRateLimitCount(key);
    
    return {
      count,
      limit: fullConfig.maxRequests,
      remaining: Math.max(0, fullConfig.maxRequests - count),
    };
  }
}
