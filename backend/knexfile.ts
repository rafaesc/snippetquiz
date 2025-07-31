import { Knex } from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'pass',
      database: process.env.DB_NAME || 'devdb',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
    },
    migrations: {
      directory: process.env.DB_MIGRATIONS_DIRECTORY || './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: process.env.DB_SEEDS_DIRECTORY || './src/seeds',
      extension: 'ts',
    },
  },
  
  production: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      max: parseInt(process.env.DB_POOL_MAX || '10'),
    },
    migrations: {
      directory: process.env.DB_MIGRATIONS_DIRECTORY || './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: process.env.DB_SEEDS_DIRECTORY || './src/seeds',
      extension: 'ts',
    },
  },
  
  test: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: `${process.env.DB_NAME || 'devdb'}_test`,
      ssl: false,
    },
    pool: {
      min: 1,
      max: 5,
    },
    migrations: {
      directory: process.env.DB_MIGRATIONS_DIRECTORY || './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: process.env.DB_SEEDS_DIRECTORY || './src/seeds',
      extension: 'ts',
    },
  },
};

export default config;