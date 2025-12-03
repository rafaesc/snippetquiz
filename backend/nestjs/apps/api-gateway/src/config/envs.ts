import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  CORE_SERVICE_HOST: string;
  AUTH_SERVICE_HOST: string;
  AI_CONTENT_SERVICE_HOST: string;
  COOKIE_SECRET: string;
  NODE_ENV: string;
  JWT_AUTH_SECRET: string;
  JWT_AUTH_EXPIRES_IN: string;
  ALLOWED_ORIGINS: string;
}

const envSchema = joi
  .object({
    CORE_SERVICE_HOST: joi.string().default('localhost'),
    AUTH_SERVICE_HOST: joi.string().default('localhost'),
    AI_CONTENT_SERVICE_HOST: joi.string().default('localhost'),
    COOKIE_SECRET: joi.string().required(),
    NODE_ENV: joi.string().default('development'),
    JWT_AUTH_SECRET: joi.string().required(),
    JWT_AUTH_EXPIRES_IN: joi.string().required(),
    ALLOWED_ORIGINS: joi
      .string()
      .default('http://localhost:3000,http://127.0.0.1:3000'),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envsVars: EnvVars = value;

const envsVarsPorts = {
  CORE_SERVICE_PORT: 3003,
  AUTH_SERVICE_PORT: 3002,
  AI_CONTENT_SERVICE_PORT: 3004,
}

export const envs = {
  apiGatewayPort: 3001,
  coreServicePort: envsVarsPorts.CORE_SERVICE_PORT,
  authServicePort: envsVarsPorts.AUTH_SERVICE_PORT,
  aiContentServicePort: envsVarsPorts.AI_CONTENT_SERVICE_PORT,
  coreServiceHost: envsVars.CORE_SERVICE_HOST,
  coreBaseUrl: `http://${envsVars.CORE_SERVICE_HOST}:${envsVarsPorts.CORE_SERVICE_PORT}`,
  authServiceHost: envsVars.AUTH_SERVICE_HOST,
  authBaseUrl: `http://${envsVars.AUTH_SERVICE_HOST}:${envsVarsPorts.AUTH_SERVICE_PORT}`,
  aiContentServiceHost: envsVars.AI_CONTENT_SERVICE_HOST,
  aiContentServiceBaseUrl: `http://${envsVars.AI_CONTENT_SERVICE_HOST}:${envsVarsPorts.AI_CONTENT_SERVICE_PORT}`,
  cookieSecret: envsVars.COOKIE_SECRET,
  nodeEnv: envsVars.NODE_ENV,
  isProduction: envsVars.NODE_ENV === 'production',
  jwtAuthSecret: envsVars.JWT_AUTH_SECRET,
  jwtAuthExpiresIn: envsVars.JWT_AUTH_EXPIRES_IN,
  allowedOrigins: envsVars.ALLOWED_ORIGINS,
};
