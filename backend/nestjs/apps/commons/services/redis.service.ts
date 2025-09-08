import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { createClient } from 'redis';
import { redisEnvs } from '../config/redis-envs';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private pub: any;
  private sub: any;
  private logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.pub = createClient({ url: redisEnvs.redisUrl });
    this.sub = this.pub.duplicate();
  }

  async onModuleInit() {
    try {
      await this.pub.connect();
      await this.sub.connect();
      this.logger.log('Redis pub/sub clients connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Redis pub/sub clients', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.pub.quit();
      await this.sub.quit();
      this.logger.log('Redis pub/sub clients disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Redis pub/sub clients', error);
    }
  }

  // Refresh token methods
  async storeRefreshToken(
    token: string,
    userId: number,
    expiresIn: string = '7d',
  ) {
    const key = `refresh_token:${token}`;
    const ttl = this.parseExpirationTime(expiresIn) * 1000; // Convert to milliseconds

    await this.cacheManager.set(key, userId.toString(), ttl);
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    const key = `refresh_token:${token}`;
    return (await this.cacheManager.get<string>(key)) || null;
  }

  async removeRefreshToken(token: string) {
    const key = `refresh_token:${token}`;
    await this.cacheManager.del(key);
  }

  // One-time code methods
  async storeOneTimeCode(
    code: string,
    userId: string,
    expiresIn: string = '5m',
  ) {
    const key = `one_time_code:${code}`;
    const ttl = this.parseExpirationTime(expiresIn) * 1000; // Convert to milliseconds

    await this.cacheManager.set(key, userId, ttl);
  }

  async validateAndConsumeOneTimeCode(code: string): Promise<string | null> {
    const key = `one_time_code:${code}`;
    const userId = await this.cacheManager.get<string>(key);

    if (userId) {
      // Delete the code after use (one-time use)
      await this.cacheManager.del(key);
    }

    return userId || null;
  }

  async acquireLock(key: string, expiresIn: string = '5m'): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const lockValue = 'locked';

    const result = await this.cacheManager.get(lockKey);

    if (result === lockValue) {
      return false;
    }

    try {
      const ttl = this.parseExpirationTime(expiresIn) * 1000;
      await this.cacheManager.set(lockKey, lockValue, ttl);

      await this.cacheManager.get(lockKey);

      return true;
    } catch (error) {
      this.logger.error(`Error acquiring lock for key: "${key}"`, error);
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;

    try {
      const result = await this.cacheManager.del(lockKey);

      if (!result) {
        this.logger.warn(
          `Lock for key: "${key}" was not found or already released`,
        );
      }
    } catch (error) {
      this.logger.error(`Error releasing lock for key: "${key}"`, error);
      throw error; // Re-throw to ensure calling code is aware of the failure
    }
  }

  async withLock<T>(
    key: string,
    callback: () => Promise<T>,
    expiresIn: string = '20m',
  ): Promise<T> {
    const startTime = Date.now();
    const acquired = await this.acquireLock(key, expiresIn);

    if (!acquired) {
      this.logger.error(
        `Resource "${key}" is already locked - operation aborted`,
      );
      throw new Error(`Resource "${key}" is already locked`);
    }

    try {
      const result = await callback();
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(
        `Error during withLock operation for key: "${key}" after ${executionTime}ms`,
        error,
      );
      await this.releaseLock(key);
      throw error;
    }
  }

  async incrementRateLimit(
    key: string,
    windowTime: string = '5m',
  ): Promise<number> {
    try {
      const rateLimitKey = `rate_limit:${key}`;

      // Get current count
      const currentCount = await this.cacheManager.get<string>(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      const newCount = count + 1;

      // Set the new count with TTL
      const ttl = this.parseExpirationTime(windowTime) * 1000; // Convert to milliseconds
      await this.cacheManager.set(rateLimitKey, newCount.toString(), ttl);

      return newCount;
    } catch (error) {
      this.logger.error(
        `Error incrementing rate limit for key: "${key}"`,
        error,
      );
      throw error;
    }
  }

  async getRateLimitCount(key: string): Promise<number> {
    try {
      const rateLimitKey = `rate_limit:${key}`;
      const count = await this.cacheManager.get<string>(rateLimitKey);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this.logger.error(
        `Error getting rate limit count for key: "${key}"`,
        error,
      );
      return 0; // Fail open - return 0 if Redis is down
    }
  }

  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowTime: string,
  ): Promise<{ exceeded: boolean; count: number; resetTime?: number }> {
    try {
      const count = await this.incrementRateLimit(key, windowTime);
      const exceeded = count > maxRequests;

      return {
        exceeded,
        count,
        resetTime: exceeded
          ? Date.now() + this.parseExpirationTime(windowTime) * 1000
          : undefined,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for key: "${key}"`, error);
      // Fail open - allow request if Redis is down
      return { exceeded: false, count: 0 };
    }
  }

  async resetRateLimit(key: string): Promise<void> {
    try {
      const rateLimitKey = `rate_limit:${key}`;
      await this.cacheManager.del(rateLimitKey);
    } catch (error) {
      this.logger.error(`Error resetting rate limit for key: "${key}"`, error);
      throw error;
    }
  }

  public parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 7 * 24 * 60 * 60; // Default to 7 days
    }
  }

  // Pub/Sub methods
  // Updated publish method with connection check
  async publish(channel: string, message: any): Promise<void> {
    try {
      // Check if client is connected
      if (!this.pub.isReady) {
        this.logger.warn(
          'Redis pub client not ready, attempting to reconnect...',
        );
        await this.pub.connect();
      }

      const serializedMessage =
        typeof message === 'string' ? message : JSON.stringify(message);
      await this.pub.publish(channel, serializedMessage);
      this.logger.log(`Published message to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Error publishing to channel: ${channel}`, error);

      // Try to reconnect if connection was lost
      if (
        error.message?.includes('closed') ||
        error.message?.includes('connection')
      ) {
        try {
          this.logger.log('Attempting to reconnect Redis pub client...');
          await this.pub.connect();

          // Retry the publish operation
          const serializedMessage =
            typeof message === 'string' ? message : JSON.stringify(message);
          await this.pub.publish(channel, serializedMessage);
          this.logger.log(
            `Published message to channel: ${channel} (after reconnect)`,
          );
        } catch (retryError) {
          this.logger.error(
            `Failed to publish after reconnect attempt`,
            retryError,
          );
          throw retryError;
        }
      } else {
        throw error;
      }
    }
  }

  async subscribeToPattern(
    pattern: string,
    callback: (channel: string, message: string) => void,
  ): Promise<void> {
    try {
      await this.sub.pSubscribe(pattern, (message: string, channel: string) => {
        callback(message, channel);
      });

      this.logger.log(`Subscribed to pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error subscribing to pattern: ${pattern}`, error);
      throw error;
    }
  }
}
