import 'dotenv/config';
import * as joi from 'joi';

interface RedisEnvVars {
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_USER?: string;
  REDIS_PASSWORD?: string;
  REDIS_TLS?: string;
}

const redisEnvSchema = joi
  .object({
    REDIS_HOST: joi.string().default('localhost'),
    REDIS_PORT: joi.number().default(6379),
    REDIS_USER: joi.string().optional(),
    REDIS_PASSWORD: joi.string().optional(),
    REDIS_TLS: joi.string().default('false'),
  })
  .unknown(true);

const { error, value } = redisEnvSchema.validate(process.env);

if (error) {
  throw new Error(`Redis config validation error: ${error.message}`);
}

export const redisEnvsVars: RedisEnvVars = value;
let redisUrl;
if (redisEnvsVars.REDIS_USER && redisEnvsVars.REDIS_PASSWORD) {
  // Both username and password provided
  redisUrl = `redis://${redisEnvsVars.REDIS_USER}:${redisEnvsVars.REDIS_PASSWORD}@${redisEnvsVars.REDIS_HOST}:${redisEnvsVars.REDIS_PORT}`;
} else if (redisEnvsVars.REDIS_PASSWORD) {
  // Only password provided (common for Redis)
  redisUrl = `redis://:${redisEnvsVars.REDIS_PASSWORD}@${redisEnvsVars.REDIS_HOST}:${redisEnvsVars.REDIS_PORT}`;
} else {
  // No authentication
  redisUrl = `redis://${redisEnvsVars.REDIS_HOST}:${redisEnvsVars.REDIS_PORT}`;
}

console.log(redisUrl);

export const redisEnvs = {
  host: redisEnvsVars.REDIS_HOST,
  port: redisEnvsVars.REDIS_PORT,
  user: redisEnvsVars.REDIS_USER,
  password: redisEnvsVars.REDIS_PASSWORD,
  redisUrl: redisUrl,
  tls: redisEnvsVars.REDIS_TLS === 'true',
};
