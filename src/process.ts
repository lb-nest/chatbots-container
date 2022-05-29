import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';

export class ProcessManager {
  private process: Record<string, ChildProcessWithoutNullStreams> = {};

  start(id: string, entry: string, env: Record<string, any>): void {
    this.stop(id);
    this.process[id] = spawn('deno', ['run', '--allow-env', '--allow-net', path.resolve(entry)], {
      env,
    });
  }

  stop(id: string): void {
    this.process[id]?.kill('SIGTERM');
  }
}
