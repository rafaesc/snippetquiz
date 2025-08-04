import { createClient } from 'redis';

class RedisService {
  private client;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', process.env.REDIS_HOST, process.env.REDIS_PORT, err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Refresh token methods
  async storeRefreshToken(token: string, userId: number, expiresIn: string = '7d') {
    const key = `refresh_token:${token}`;
    const expirationSeconds = this.parseExpirationTime(expiresIn);
    
    await this.client.setEx(key, expirationSeconds, userId.toString());
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    const key = `refresh_token:${token}`;
    return await this.client.get(key);
  }

  async removeRefreshToken(token: string) {
    const key = `refresh_token:${token}`;
    await this.client.del(key);
  }

  async removeAllUserRefreshTokens(userId: number) {
    const pattern = `refresh_token:*`;
    const keys = await this.client.keys(pattern);
    
    for (const key of keys) {
      const storedUserId = await this.client.get(key);
      if (storedUserId === userId.toString()) {
        await this.client.del(key);
      }
    }
  }

  private parseExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 7 * 24 * 60 * 60; // Default to 7 days
    }
  }
}

export const redisService = new RedisService();