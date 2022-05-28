import EventEmitter from 'https://deno.land/x/events/mod.ts';
import { ConfigByEnvironmemt } from './config';

export class ConnectionManager extends EventEmitter {
  constructor(private ws: WebSocket, private config: ConfigByEnvironmemt) {
    super();
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  async start() {
    return new Promise<void>((resolve) => {
      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            type: 'init',
            payload: this.config.get('TOKEN'),
          }),
        );

        resolve();
      };
    });
  }

  send(data: Record<string, any>) {
    this.ws.send(JSON.stringify(data));
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data.toString());
      switch (data.type) {
        case 'init':
          break;

        default:
          this.emit(data.type, data);
          break;
      }
    } catch {}
  }
}
