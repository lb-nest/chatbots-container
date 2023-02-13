export class Queue {
  private fn: Array<() => Promise<void> | void> = [];
  private lock = false;

  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        const fn = this.fn.shift();
        return {
          done: fn === undefined,
          value: fn,
        };
      },
    };
  }

  async push(fn: () => Promise<void> | void): Promise<void> {
    this.fn.push(fn);
    if (!this.lock) {
      await this.execute();
    }
  }

  async unshift(fn: () => Promise<void> | void): Promise<void> {
    this.fn.unshift(fn);
    if (!this.lock) {
      await this.execute();
    }
  }

  private async execute(): Promise<void> {
    this.lock = true;
    try {
      for await (const fn of this) {
        await fn?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.lock = false;
    }
  }
}
