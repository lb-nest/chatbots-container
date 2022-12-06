import dotenv from 'dotenv';
import { cleanEnv, str, url } from 'envalid';

dotenv.config();

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'staging', 'test', 'production'],
    default: 'development',
  }),
  CONTAINER_ID: str(),
  SECRET: str(),
  CHATBOTS_URL: url(),
});

export type Config = typeof config;
