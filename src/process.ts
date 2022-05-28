import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';

export class ProcessManager {
  private static readonly processes: Record<number, ProcessManager> = {};

  private process: ChildProcessWithoutNullStreams;

  static get(id: number) {
    return this.processes[id];
  }

  async start() {
    this.process = spawn(
      'deno',
      ['run', '--allow-env', '--allow-net', path.resolve('runtime/index.ts')],
      {
        env: {
          WEBSOCKET_EDGE_URL: 'ws://localhost:1337',
        },
      },
    );

    ProcessManager.processes[this.process.pid] = this;
    return this.process.pid;
  }

  async stop() {
    this.process.kill('SIGTERM');
    return 'ok';
  }
}
