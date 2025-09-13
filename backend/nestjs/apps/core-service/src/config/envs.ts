import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  CORE_SERVICE_HOST: string;
  CORE_SERVICE_PORT: number;
  DATABASE_URL_POSTGRES: string;
  NODE_ENV: string;
  KAFKA_HOST: string;
  KAFKA_PORT: number;
}

const envSchema = joi
  .object({
    CORE_SERVICE_HOST: joi.string().default('0.0.0.0'),
    CORE_SERVICE_PORT: joi.number().required(),
    DATABASE_URL_POSTGRES: joi.string().required(),
    NODE_ENV: joi.string().default('development'),
    KAFKA_HOST: joi.string().default('localhost'),
    KAFKA_PORT: joi.number().default(9092),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envsVars: EnvVars = value;

export const envs = {
  coreServiceHost: envsVars.CORE_SERVICE_HOST,
  coreServicePort: envsVars.CORE_SERVICE_PORT,
  kafkaHost: envsVars.KAFKA_HOST,
  kafkaPort: envsVars.KAFKA_PORT,
  kafkaCoreConsumerGroup: "core-service-consumer-group",
  kafkaEmitQuizConsumerGroup: "core-service-emit-quiz-consumer-group",
  databaseUrlPostgres: envsVars.DATABASE_URL_POSTGRES,
  nodeEnv: envsVars.NODE_ENV,
  isProduction: envsVars.NODE_ENV === 'production',
};
