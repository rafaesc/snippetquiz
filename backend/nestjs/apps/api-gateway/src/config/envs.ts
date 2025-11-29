import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  API_GATEWAY_PORT: number;
  CORE_SERVICE_PORT: number;
  CORE_SERVICE_HOST: string;
  AUTH_SERVICE_PORT: number;
  AUTH_SERVICE_HOST: string;
  AI_CONTENT_SERVICE_PORT: number;
  AI_CONTENT_SERVICE_HOST: string;
  COOKIE_SECRET: string;
  NODE_ENV: string;
  JWT_AUTH_SECRET: string;
  JWT_AUTH_EXPIRES_IN: string;
  ALLOWED_ORIGINS: string;
  CHARACTER_SPRITE_URL: string;
}

const envSchema = joi
  .object({
    API_GATEWAY_PORT: joi.number().required(),
    CORE_SERVICE_PORT: joi.number().required(),
    CORE_SERVICE_HOST: joi.string().default('localhost'),
    AUTH_SERVICE_PORT: joi.number().required(),
    AUTH_SERVICE_HOST: joi.string().default('localhost'),
    AI_CONTENT_SERVICE_PORT: joi.number().required(),
    AI_CONTENT_SERVICE_HOST: joi.string().default('localhost'),
    COOKIE_SECRET: joi.string().required(),
    NODE_ENV: joi.string().default('development'),
    JWT_AUTH_SECRET: joi.string().required(),
    JWT_AUTH_EXPIRES_IN: joi.string().required(),
    ALLOWED_ORIGINS: joi
      .string()
      .default('http://localhost:3000,http://127.0.0.1:3000'),
    CHARACTER_SPRITE_URL: joi.string().optional(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envsVars: EnvVars = value;

export const envs = {
  apiGatewayPort: envsVars.API_GATEWAY_PORT,
  coreServicePort: envsVars.CORE_SERVICE_PORT,
  coreServiceHost: envsVars.CORE_SERVICE_HOST,
  coreBaseUrl: `http://${envsVars.CORE_SERVICE_HOST}:${envsVars.CORE_SERVICE_PORT}`,
  authServicePort: envsVars.AUTH_SERVICE_PORT,
  authServiceHost: envsVars.AUTH_SERVICE_HOST,
  authBaseUrl: `http://${envsVars.AUTH_SERVICE_HOST}:${envsVars.AUTH_SERVICE_PORT}`,
  aiContentServicePort: envsVars.AI_CONTENT_SERVICE_PORT,
  aiContentServiceHost: envsVars.AI_CONTENT_SERVICE_HOST,
  aiContentServiceBaseUrl: `http://${envsVars.AI_CONTENT_SERVICE_HOST}:${envsVars.AI_CONTENT_SERVICE_PORT}`,
  cookieSecret: envsVars.COOKIE_SECRET,
  nodeEnv: envsVars.NODE_ENV,
  isProduction: envsVars.NODE_ENV === 'production',
  jwtAuthSecret: envsVars.JWT_AUTH_SECRET,
  jwtAuthExpiresIn: envsVars.JWT_AUTH_EXPIRES_IN,
  allowedOrigins: envsVars.ALLOWED_ORIGINS,
  characterSpriteUrl: envsVars.CHARACTER_SPRITE_URL,
};
