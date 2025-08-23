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

export const redisEnvs = {
  host: redisEnvsVars.REDIS_HOST,
  port: redisEnvsVars.REDIS_PORT,
  user: redisEnvsVars.REDIS_USER,
  password: redisEnvsVars.REDIS_PASSWORD,
  tls: redisEnvsVars.REDIS_TLS === 'true',
};
