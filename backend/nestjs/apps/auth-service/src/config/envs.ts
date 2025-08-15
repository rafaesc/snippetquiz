import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  AUTH_SERVICE_PORT: number;
  DATABASE_URL_POSTGRES: string;
  JWT_AUTH_SECRET: string;
  JWT_AUTH_REFRESH_SECRET: string;
  JWT_AUTH_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_AUTH_VERIFICATION_SECRET: string;
  JWT_AUTH_VERIFICATION_EXPIRES_IN: string;
  EMAIL_USERNAME?: string | null;
  EMAIL_PASSWORD?: string | null;
  FRONTEND_URL: string;
  COOKIE_SECRET: string;
  NODE_ENV: string;
}

const envSchema = joi
  .object({
    AUTH_SERVICE_PORT: joi.number().required(),
    DATABASE_URL_POSTGRES: joi.string().required(),
    JWT_AUTH_SECRET: joi.string().required(),
    JWT_AUTH_REFRESH_SECRET: joi.string().required(),
    JWT_AUTH_EXPIRES_IN: joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
    JWT_AUTH_VERIFICATION_SECRET: joi.string().required(),
    JWT_AUTH_VERIFICATION_EXPIRES_IN: joi.string().default('24h'),
    EMAIL_USERNAME: joi.string().optional(),
    EMAIL_PASSWORD: joi.string().optional(),
    FRONTEND_URL: joi.string().default('http://localhost:3000'),
    COOKIE_SECRET: joi.string().required(),
    NODE_ENV: joi.string().default('development'),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envsVars: EnvVars = value;

export const envs = {
  authServicePort: envsVars.AUTH_SERVICE_PORT,
  databaseUrlPostgres: envsVars.DATABASE_URL_POSTGRES,
  jwtAuthSecret: envsVars.JWT_AUTH_SECRET,
  jwtAuthRefreshSecret: envsVars.JWT_AUTH_REFRESH_SECRET,
  jwtAuthExpiresIn: envsVars.JWT_AUTH_EXPIRES_IN,
  jwtRefreshExpiresIn: envsVars.JWT_REFRESH_EXPIRES_IN,
  jwtAuthVerificationSecret: envsVars.JWT_AUTH_VERIFICATION_SECRET,
  jwtAuthVerificationExpiresIn: envsVars.JWT_AUTH_VERIFICATION_EXPIRES_IN,
  emailUsername: envsVars.EMAIL_USERNAME,
  emailPassword: envsVars.EMAIL_PASSWORD,
  frontendUrl: envsVars.FRONTEND_URL,
  cookieSecret: envsVars.COOKIE_SECRET,
  nodeEnv: envsVars.NODE_ENV,
  isProduction: envsVars.NODE_ENV === 'production',
};
