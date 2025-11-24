import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  NODE_ENV: string;
  POSTGRESQL_PRISMA_AI_PROCESSOR_URL: string;
  KAFKA_HOST: string;
  KAFKA_PORT: number;
  OPENROUTER_API_KEY: string;
}

const envSchema = joi
  .object({
    NODE_ENV: joi.string().default('development'),
    POSTGRESQL_PRISMA_AI_PROCESSOR_URL: joi.string().required(),
    KAFKA_HOST: joi.string().required(),
    KAFKA_PORT: joi.number().required(),
    OPENROUTER_API_KEY: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envsVars: EnvVars = value;

export const envs = {
  nodeEnv: envsVars.NODE_ENV,
  isProduction: envsVars.NODE_ENV === 'production',
  databaseUrlPostgres: envsVars.POSTGRESQL_PRISMA_AI_PROCESSOR_URL,
  kafkaHost: envsVars.KAFKA_HOST,
  kafkaPort: envsVars.KAFKA_PORT,
  openRouterApiKey: envsVars.OPENROUTER_API_KEY,
};
