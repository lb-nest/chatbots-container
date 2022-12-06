import { ChildProcess, spawn } from 'child_process';
import { resolve } from 'path';
import { logger } from './logger';

const pm: Record<number, ChildProcess> = {};

export const start = async (
  id: number,
  env?: Record<string, any>,
): Promise<void> => {
  await stop(id);

  pm[id] = spawn('node', ['-r', 'ts-node/register/transpile-only', 'main.ts'], {
    env: Object.assign(env, {
      PATH: process.env.PATH,
    }),
    cwd: resolve(process.cwd(), 'runtime'),
  });

  pm[id].stdout.on('data', handleStdOut);
  pm[id].stderr.on('data', handleStdErr);
  pm[id].on('exit', () => {
    stop(id);
  });
};

export const stop = async (id: number): Promise<void> => {
  if (pm[id]?.kill('SIGTERM')) {
    pm[id].removeAllListeners();
    delete pm[id];
  }
};

const handleStdOut = (data: any): void => {
  logger.log(data.toString());
};

const handleStdErr = (data: any): void => {
  logger.log(data.toString());
};
