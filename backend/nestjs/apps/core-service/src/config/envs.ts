import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  CORE_SERVICE_PORT: number;
  DATABASE_URL_POSTGRES: string;
  NODE_ENV: string;
}

const envSchema = joi
  .object({
    CORE_SERVICE_PORT: joi.number().required(),
    DATABASE_URL_POSTGRES: joi.string().required(),
    NODE_ENV: joi.string().default('development'),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envsVars: EnvVars = value;

export const envs = {
  coreServicePort: envsVars.CORE_SERVICE_PORT,
  databaseUrlPostgres: envsVars.DATABASE_URL_POSTGRES,
  nodeEnv: envsVars.NODE_ENV,
  isProduction: envsVars.NODE_ENV === 'production',
};
