import dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

dotenv.config();

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'staging', 'test', 'production'],
    default: 'development',
  }),
  PORT: port({
    default: 8080,
  }),
  SECRET: str(),
});

export type Config = typeof config;
