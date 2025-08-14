import { Injectable, Logger } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class RedisService {
  private logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // Refresh token methods
  async storeRefreshToken(
    token: string,
    userId: number,
    expiresIn: string = '7d',
  ) {
    const key = `refresh_token:${token}`;
    const ttl = this.parseExpirationTime(expiresIn) * 1000; // Convert to milliseconds

    await this.cacheManager.set(key, userId.toString(), ttl);
    this.logger.log(`Stored refresh token for user ${userId}`);
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    const key = `refresh_token:${token}`;
    return (await this.cacheManager.get<string>(key)) || null;
  }

  async removeRefreshToken(token: string) {
    const key = `refresh_token:${token}`;
    await this.cacheManager.del(key);
    this.logger.log(`Removed refresh token: ${token}`);
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
    this.logger.log(`Stored one-time code for user ${userId}`);
  }

  async validateAndConsumeOneTimeCode(code: string): Promise<string | null> {
    const key = `one_time_code:${code}`;
    const userId = await this.cacheManager.get<string>(key);

    if (userId) {
      // Delete the code after use (one-time use)
      await this.cacheManager.del(key);
      this.logger.log(`Consumed one-time code: ${code}`);
    }

    return userId || null;
  }

  private parseExpirationTime(expiresIn: string): number {
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
}
