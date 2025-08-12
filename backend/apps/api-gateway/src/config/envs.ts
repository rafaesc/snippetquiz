import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
    API_GATEWAY_PORT: number;
    AUTH_SERVICE_PORT: number;
    COOKIE_SECRET: string;
    NODE_ENV: string;
    JWT_AUTH_SECRET: string;
    JWT_AUTH_EXPIRES_IN: string;
}

const envSchema = joi.object({
    API_GATEWAY_PORT: joi.number().required(),
    AUTH_SERVICE_PORT: joi.number().required(),
    COOKIE_SECRET: joi.string().required(),
    NODE_ENV: joi.string().default('development'),
    JWT_AUTH_SECRET: joi.string().required(),
    JWT_AUTH_EXPIRES_IN: joi.string().required(),
}).unknown(true)

const { error, value } = envSchema.validate(process.env)

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

export const envsVars: EnvVars = value

export const envs = {
    apiGatewayPort: envsVars.API_GATEWAY_PORT,
    authServicePort: envsVars.AUTH_SERVICE_PORT,
    cookieSecret: envsVars.COOKIE_SECRET,
    nodeEnv: envsVars.NODE_ENV,
    isProduction: envsVars.NODE_ENV === 'production',
    jwtAuthSecret: envsVars.JWT_AUTH_SECRET,
    jwtAuthExpiresIn: envsVars.JWT_AUTH_EXPIRES_IN,

}