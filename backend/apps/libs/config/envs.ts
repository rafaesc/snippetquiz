import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
    AUTH_SERVICE_PORT: number;
    DATABASE_URL_POSTGRES: string;
}

const envSchema = joi.object({
    AUTH_SERVICE_PORT: joi.number().required(),
    DATABASE_URL_POSTGRES: joi.string().required(),
}).unknown(true)

const { error, value } = envSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

export const envsVars: EnvVars = value

export const envs = {
    authServicePort: envsVars.AUTH_SERVICE_PORT,
    databaseUrlPostgres: envsVars.DATABASE_URL_POSTGRES,
}
