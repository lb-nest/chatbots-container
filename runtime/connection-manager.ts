import EventEmitter from 'https://deno.land/x/events/mod.ts';

export class ConnectionManager extends EventEmitter {
  private ws: WebSocket;

  constructor(url: string, private token: string) {
    super();
    this.ws = new WebSocket(url);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  start() {
    this.ws.onopen = () => {
      this.send({
        type: 'init',
        payload: this.token,
      });
    };
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
