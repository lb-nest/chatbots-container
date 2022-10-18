import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import path from 'path';

export class ProcessManager {
  private pm: Record<string, ChildProcessWithoutNullStreams> = {};

  start(id: string, entry: string, env?: Record<string, any>): void {
    this.stop(id);
    this.pm[id] = spawn('deno', ['run', '--allow-env', '--allow-net', path.resolve(entry)], {
      env,
    });

    this.pm[id].stdout.on('data', this.handleStdout.bind(this));
    this.pm[id].stderr.on('data', this.handleStgErr.bind(this));
    this.pm[id].on('close', () => {
      this.stop(id);
    });
  }

  stop(id: string): void {
    if (this.pm[id]?.kill('SIGTERM')) {
      this.pm[id].removeAllListeners();
      delete this.pm[id];
    }
  }

  dispose(): void {
    for (const id of Object.keys(this.pm)) {
      this.stop(id);
    }
  }

  private handleStdout(data: any): void {
    console.log(data.toString());
  }

  private handleStgErr(data: any): void {
    console.log(data.toString());
  }
}
